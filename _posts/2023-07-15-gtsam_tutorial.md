---
layout: post
title: "GTSAM 튜토리얼"
subtitle: "Pose Graph Optimization (PGO) for SLAM"
date: 2023-07-15
comments: true
---

### 주저리주저리
+ SLAM을 항상 접할 수 밖에 없는 환경에 있다. 연구실이 워낙 SLAM을 잘하기도 하고, 내가 아무리 exploration이나 high level path planning 알고리즘을 작성해서 드론에 실험하려고 해도, 결국 드론은 SLAM이 없으면 비행이 불가능하기에...
+ 드론은 무게가 중요하니까 처음엔 VO, VIO를 사용했었다. 너무 쉽게 발산해서... 대회때라든지 쓴맛을 많이 봐서 자연스럽게 LiDAR SLAM으로 넘어오게 되었다. 요새는 SLAM까지 안가더라도 LIO만 써도 너무 정확하게 pose가 추정이 된다.
+ 그럼에도, loop-closing으로 정밀한 map을 만들어서 저장할 필요가 가끔 있다. Visualization 용도로 예쁜 3D map을 만들때나, 동일한 환경에서 로봇이 반복 작업을 수행할때는 SLAM을 반복해서 쓸 필요 없이 scan-to-map matching기반 localization만 사용해도 되기때문.

<br>

### 그래서 해당 포스트에서는
+ GTSAM을 사용해서 SLAM을 위한 PGO(pose graph optimization)를 구현하는 방법에 대해 설명하고자 한다. (다른 용도도 많지만 **only PGO for SLAM**)
	+ 더 다양한 튜토리얼은 [공식 홈페이지 튜토리얼](https://gtsam.org/tutorials/intro.html#listing_iSAMExample)을 참고하면 된다.
+ 자세히는 아래 내용을 차례대로 설명하고자 한다.
	+ 예제 코드
	+ `Factor` vs `Values` in GTSAM
	+ `gtsam::ISAM2.update` vs `gtsam::LevenbergMarquardtOptimizer`
	+ `gtsam::ISAM2.update(graph, initial_estimation)` vs `gtsam::ISAM2.update()` (특히 multiple times of update)

<br>

### 1. 예제 코드
+ 생각보다 쉬우니 바로 예제 코드 먼저 살펴보자. 해당 코드는 최근에 코딩 및 작업한 [FAST-LIO-SAM](https://github.com/engcang/FAST-LIO-SAM) 혹은 [FAST-LIO-SAM-QN](https://github.com/engcang/FAST-LIO-SAM-QN) repository에 실제 사용된 코드 중 필요한 일부만 가져와서 정리한 코드이다.

```cpp
////// GTSAM headers
#include <gtsam/geometry/Rot3.h>
#include <gtsam/geometry/Point3.h>
#include <gtsam/geometry/Pose3.h>
#include <gtsam/slam/PriorFactor.h>
#include <gtsam/slam/BetweenFactor.h>
#include <gtsam/nonlinear/NonlinearFactorGraph.h>
#include <gtsam/nonlinear/LevenbergMarquardtOptimizer.h>
#include <gtsam/nonlinear/Values.h>
#include <gtsam/nonlinear/ISAM2.h>

using namespace std;

////// GTSAM variables
shared_ptr<gtsam::ISAM2> m_isam_handler = nullptr;
gtsam::NonlinearFactorGraph m_gtsam_graph;
gtsam::Values m_init_esti; // initial estimation (초기 위치 추정치)
gtsam::Values m_corrected_esti; //Graph optimized된 보정된 위치 추정치
int m_keyframe_index = 0;

////// GTSAM init
gtsam::ISAM2Params isam_params_;
isam_params_.relinearizeThreshold = 0.01;
isam_params_.relinearizeSkip = 1;
m_isam_handler = std::make_shared<gtsam::ISAM2>(isam_params_);

////// Odometry callback function
void odometry_callback_function(current_odometry) //실제 함수 아님, pseudo code
{
  if (!initialized) // 최초 1회만 odometry를 Priorfactor로 추가
  {
    gtsam::noiseModel::Diagonal::shared_ptr prior_noise = gtsam::noiseModel::Diagonal::Variances((gtsam::Vector(6) << 1e-4, 1e-4, 1e-4, 1e-4, 1e-4, 1e-4).finished()); // rad*rad for roll, pitch, ywa and meter*meter for x, y, z
    // for the first odometry, priorfactor
    m_gtsam_graph.add(gtsam::PriorFactor<gtsam::Pose3>(0, odometry_to_gtsam_pose(current_odometry), prior_noise));
    m_init_esti.insert(m_current_keyframe_idx, odometry_to_gtsam_pose(current_odometry));
    m_keyframe_index++;
    initialized = true;
  }
  else //그 이후 odometry callback 마다
  {
    if (if_keyframe_or_not(current_odometry)) //keyframe인지 검사하고 keyframe이면
    {
      ///// 1. keyframe사이의 pose 변화를 graph에 추가
      gtsam::noiseModel::Diagonal::shared_ptr odom_noise = gtsam::noiseModel::Diagonal::Variances((gtsam::Vector(6) << 1e-4, 1e-4, 1e-4, 1e-2, 1e-2, 1e-2).finished());
      gtsam::Pose3 pose_from = odometry_to_gtsam_pose(last_odometry);
      gtsam::Pose3 pose_to = odometry_to_gtsam_pose(current_odometry);
      // 직전, 현재 keyframe odometry 사이의 odometry 변화값을 BetweenFactor로 그래프에 추가
      m_gtsam_graph.add(gtsam::BetweenFactor<gtsam::Pose3>(m_keyframe_index-1, m_keyframe_index, pose_from.between(pose_to), odom_noise));
      m_init_esti.insert(m_keyframe_index, pose_to);
      m_keyframe_index++;
      last_odometry = current_odometry; //다음 iteration을 위해 직전 odometry 저장

      ///// 2. loop closing factor
      bool if_loop_closed = false;
      // 과거의 keyframe들과 현재 keyframe을 비교해서, loop closing이 일어날 수 있을 가능성이 있는지 파악 (예: 일정 거리 이내에 있으나 시간이 일정 시간 이상 경과)
      if (if_loop_candidate_or_not(current_odometry))
      {
        the_most_loop_likely_keyframe = get_the_most_loop_likely_keyframe(current_odometry); //가장 loop 가능성이 높은 keyframe 반환
        loop_match_result = loop_matching(current_odometry, the_most_loop_likely_keyframe); //현재 keyframe, loop 가능성 높은 keyframe 사이를 매칭해서 pose 변환 반환 (e.g., ICP 등)

        // 실제로 loop-closed 되었으면
        if (loop_match_result.loop_closed)
        {
          noise = loop_match_result.noise;
          loop_pose_tf = loop_match_result.pose_transformation;
          past_pose = the_most_loop_likely_keyframe.pose;
          past_pose_index = the_most_loop_likely_keyframe.pose.index;
          current_odometry_index = m_keyframe_index-1; // becaus of ++ from the above line

          // 현재 keyframe과 loop-closed 된 keyframe간의 pose 변화만큼을 graph에 BetweenFactor로 추가
          gtsam::noiseModel::Diagonal::shared_ptr loop_noise = gtsam::noiseModel::Diagonal::Variances((gtsam::Vector(6) << noise, noise, noise, noise, noise, noise).finished());
          gtsam::Pose3 pose_from = odometry_to_gtsam_pose(loop_pose_tf * current_odometry);
          gtsam::Pose3 pose_to = odometry_to_gtsam_pose(past_pose);
          m_gtsam_graph.add(gtsam::BetweenFactor<gtsam::Pose3>(current_odometry_index, past_pose_index, pose_from.between(pose_to), loop_noise));	    		
          if_loop_closed = true;
        }
      }

      ///// 3. Optimize
      //m_corrected_esti = gtsam::LevenbergMarquardtOptimizer(m_gtsam_graph, m_init_esti).optimize();
      m_isam_handler->update(m_gtsam_graph, m_init_esti);
      m_isam_handler->update();
      if (if_loop_closed)
      {
        m_isam_handler->update();
        m_isam_handler->update();
        m_isam_handler->update();
      }
      m_gtsam_graph.resize(0);
      m_init_esti.clear();
      // 보정된 위치 추정치
      m_corrected_esti = m_isam_handler->calculateEstimate();
    }
  }
}
```

<br>

+ 조금 긴 것 같은데, 별거 없다. 그림과 함께 보자.
	+	최초 odometry는 PriorFactor로 graph에 추가한다.
	+ Keyframe 사이의 pose변화를 BetweenFactor로 graph에 추가한다. (keyframe 계산 없이 모든 odometry를 graph에 추가하면... 연산량도 어마어마하고 오히려 redundancy가 accuracy를 해친다.)
	+ 현재 keyframe과 과거 keyframes 사이에 loop-closing을 검사 및 계산해서 BetweenFactor로 graph에 추가한다.
	+ Graph를 optimize 한다.

<p align="center">
	<figure align="center">
  	<img src="/assets/img/posts/230707_sphere.gif" style="width:90%" onContextMenu="return false;" onselectstart="return false" ondragstart="return false">
		<figcaption style="text-align:center;">GTSAM PGO</figcaption>
	</figure>
</p>


+ 처음 보는 사람들은, 대충 알긴 알겠는데 몇 가지 **"왜?"** 하는 부분들이 생긴다. => 뒤에서 하나씩 설명한다.


<br>

### 2. `Factor` vs `Values` in GTSAM
+ 코드에서 분명히 graph(`m_gtsam_graph`)에 PriorFactor, BetweenFactor로 odometry의 변화량, loop-closing의 값 등을 더 해줬는데 gtsam::Values(`m_init_esti`)에 한번 더 값을 insert해준다.
+ 게다가 loop-closing 계산 뒤 BetweenFactor를 add해주는 곳에서는 Values에 아무런 값도 insert하지 않는다.
+ 이 부분에 대해서 [공식 홈페이지 튜토리얼](https://gtsam.org/tutorials/intro.html#listing_iSAMExample)의 2.3절에서는 다음과 같이 설명한다.
	1. The factor graph and its embodiment in code specify the joint probability distribution over the entire trajectory of the robot, rather than just the last pose. This smoothing view of the world gives GTSAM its name: “smoothing and mapping”. Later in this document we will talk about how we can also use GTSAM to do filtering (which you often do not want to do) or incremental inference (which we do all the time).
	2. A factor graph in GTSAM is just the specification of the probability density, and the corresponding FactorGraph class and its derived classes do not ever contain a “solution”. Rather, there is a separate type Values that is used to specify specific values, which can then be used to evaluate the probability (or, more commonly, the error) associated with particular values.
	3. The latter point is often a point of confusion with beginning users of GTSAM. It helps to remember that when designing GTSAM we took a functional approach of classes corresponding to mathematical objects, which are usually immutable. You should think of a factor graph as a function to be applied to values rather than as an object to be modified.
+ 뭔 소리냐면, graph는 

<br>

### 3. `gtsam::ISAM2.update` vs `gtsam::LevenbergMarquardtOptimizer`
+ 코드에서 optimize하는 부분을 보면 주석된 부분이 있다. 다시 잘 살펴 보면, 한 줄로 해결할 수 있을 것 같은데 굳이 여러줄로 나누어서 optimize하고 graph랑 Values 초기화하고, 보정된 값을 획득한다.

```cpp
//// 이 한줄이랑
{
  m_corrected_esti = gtsam::LevenbergMarquardtOptimizer(m_gtsam_graph, m_init_esti).optimize();
}
//// 이 여러줄이랑 같은 역할임
{
  m_isam_handler->update(m_gtsam_graph, m_init_esti);
  m_gtsam_graph.resize(0);
  m_init_esti.clear();
  m_corrected_esti = m_isam_handler->calculateEstimate();  
}
```

<br>

### 4. `gtsam::ISAM2.update(graph, initial_estimation)` vs `gtsam::ISAM2.update()`

<br>

### 5. 결론


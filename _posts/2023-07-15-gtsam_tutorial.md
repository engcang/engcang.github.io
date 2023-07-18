---
layout: post
title: "GTSAM 튜토리얼"
subtitle: "Pose Graph Optimization (PGO) for SLAM"
date: 2023-07-15
comments: true
---

#### 주저리주저리
SLAM을 항상 접할 수 밖에 없는 환경에 있다. 연구실이 워낙 SLAM을 잘하기도 하고, 내가 아무리 exploration이나 high level path planning 알고리즘을 작성해서 드론에 실험하려고 해도, 결국 드론은 SLAM이 없으면 비행이 불가능하기에... <br>
드론은 무게가 중요하니까 처음엔 VO, VIO를 사용했었다. 너무 쉽게 발산해서... 대회때라든지 쓴맛을 많이 봐서 자연스럽게 LiDAR SLAM으로 넘어오게 되었다. 요새는 SLAM까지 안가더라도 LIO만 써도 너무 정확하게 pose가 추정이 된다. <br>
그럼에도, loop-closing으로 정밀한 map을 만들어서 저장할 필요가 가끔 있다. Visualization 용도로 예쁜 3D map을 만들때나, 동일한 환경에서 로봇이 반복 작업을 수행할때는 SLAM을 반복해서 쓸 필요 없이 scan-to-map matching기반 localization만 사용해도 되기때문.

#### 그래서 해당 포스트에서는
+ GTSAM을 사용해서 SLAM을 위한 PGO(pose graph optimization)를 구현하는 방법에 대해 설명하고자 한다. (다른 용도도 많지만 **only PGO for SLAM**)
	+ 더 다양한 튜토리얼은 [공식 홈페이지 튜토리얼](https://gtsam.org/tutorials/intro.html#listing_iSAMExample)을 참고하면 된다.
+ 자세히는 아래 내용을 차례대로 설명하고자 한다.
	+ 예제 코드
	+ `Factor` vs `Values` in GTSAM
	+ `gtsam::ISAM2.update(graph, initial_estimation)` vs `gtsam::LevenbergMarquardtOptimizer(graph, initial_estimation)`
	+ `gtsam::ISAM2.update(graph, initial_estimation)` vs `gtsam::ISAM2.update()` (특히 multiple times of update)


<br>

+ Size를 확실히 알아서 static한 size로 사용 하면 `array`
	+ 예
	```cpp
double xyz[3];
Eigen::Vector3f points[3]; // e.g., 3points of plane
	```
+ `vector`
	+ 뒷쪽에만 push 및 pop이 가능하고 중간에서 erase나 insert하면 비효율적
	+ Size를 대충이라도 알면 `reserve()`해서 사용하는게 효율적이고 더 빠름
	+ 개별 원소 접근이 빠름, 뒷쪽 삽입/제거는 빠름
	+	메모리에서 연속적으로 저장되므로
		+ 메모리 효율적으로 데이터 관리 가능
		+ 빈번한 삽입 삭제에 비효율적
			+ 삽입 시 메모리 할당량을 늘리는 연산 발생
			+ 중간에서 삽입, 삭제 시 연속된 메모리 블럭을 한칸씩 당기거나 밀어줘야하므로 비효율적임
	+ 예시1: size를 아는 경우 (`PointVector`가 `std::vector`로 구현되어있음)
		```cpp
PointVector pcl_to_pointvector(const pcl::PointCloud<pcl::PointXYZ> &pcl_in)
{
  PointVector pointvector_out_;
  if (pcl_in.size() > 0) pointvector_out_.reserve(pcl_in.size());
  for (int i = 0; i < pcl_in.size(); ++i)
  {
    pointvector_out_.push_back(PointType(pcl_in.points[i].x, pcl_in.points[i].y, pcl_in.points[i].z));
  }
  return pointvector_out_;
}
		```
	+ 예시2: size를 대충 아는 경우	(if 조건문에 의해 size가 조금 달라질 수 있음, `pcl::PointCloud`가 `std::vector`로 구현되어있음)
		```cpp
pcl::PointCloud<pcl::PointXYZ> get_pts_within_fov(const pcl::PointCloud<pcl::PointXYZ> &pcl_in, const vector<float> &cam_fov, const float &curr_yaw, const float &curr_pitch)
{
  pcl::PointCloud<pcl::PointXYZ> pcl_out_;
  if (pcl_in.size() > 0) pcl_out_.reserve(pcl_in.size());
  for (int i = 0; i < pcl_in.size(); ++i)
  {
    pcl::PointXYZ pt_ = pcl_in.points[i];
    if ( fabs(curr_yaw - pt_yaw(pt_)) < cam_fov[0] && fabs(curr_pitch - pt_pitch(pt_)) < cam_fov[1]) //angles diff
    {
      pcl_out_.push_back(pcl_in[i]);
    }
  }
  return pcl_out_;
}
		```

+ `deque` (**발음 디큐라고 안읽고 덱으로 읽음**)
	+ front와 back에 모두 push 및 pop이 가능함
	+ 개별 원소 접근이 빠름 앞, 뒷쪽 삽입/제거 빠름
	+ 메모리에서 흩어져서 저장되므로
		+ 뒷쪽이 아닌 중간에서 삽입, 삭제할 때 `vector`에 비해서는 효율적
		+ 빈번한 삽입 삭제에 `vector`에 비해 효율적
+ `unordered_map`
	+ 삽입, 삭제 탐색이 O(1)
	+ 앞쪽, 뒷쪽, 중간 아무곳에서나 빈번하게 삽입, 삭제, 탐색을 많이 하는 경우 굉장히 효율적
	+ 전체 저장된 데이터에 대해 iteration이 `map`에 비해 느림
	+ `map`에 비해 메모리를 많이 씀
	+ 예시 - 공간을 mapping하며 sphere형태의 safety flight corridor (SFC)를 생성할 때, obstacle에 의해서 굉장히 빈번하게 sphere를 삭제, 새로 생성해서 container에 삽입 및 관리해야함
	<p align="center">
		<figure align="center">
	  	<img src="/assets/img/posts/230707_sphere.gif" style="width:90%" onContextMenu="return false;" onselectstart="return false" ondragstart="return false">
			<figcaption style="text-align:center;">unordered_map으로 관리하는 spheres</figcaption>
		</figure>
	</p>

+ `map`
	+ 삽입, 삭제 탐색이 O(logN), 대신 데이터가 key값에 따라 항상 sort 되어있으므로 따로 sort할 필요가 없음
	+ 전체 저장된 데이터에 대해 iteration이 빠름
	+ `unordered_map`에 비해 메모리를 적게 씀
+ `unordered_set` (`set`과의 차이점은 `map`과 `unordered_map`과의 차이점과 동일)
	+ 중복을 허용하지 않는 container
	+ `raycasting` 등으로 데이터 처리할때 유용함. 여러개의 ray에 대해서 일일이 순차적으로 voxel에 대한 정보를 update하지 않고, 일단 처리해야할 voxel의 index만 `unordered_set`에 저장 후 한번에 처리하면 같은 index의 voxel에 대해 불필요하게 연산하는 것을 자연스럽게 막아줌
	+ 예시
```cpp
void remove_points_raycast(const Vector3f &origin, const pcl::PointCloud<pcl::PointXYZ> &pts_in)
{
	Vector3i origin_key_ = pt_to_key(origin);
	unordered_set<Vector3i, hash_func> key_set_to_be_del_;
	for (int i = 0; i < pts_in.size(); ++i)
	{
		  Vector3i key_ = pt_to_key(pt_to_pt_type(pts_in.points[i]));
		  Raycast(origin, pt_to_pt_type(pts_in.points[i]), key_set_to_be_del_);
	}
	for (const auto& key: key_set_to_be_del_) //delete keys on the rays
	{ 
		  m_hash_vox_points.erase(key);
	}
	return;
}
```

<br/>

### 결론
+ `array` - size를 알고, 데이터가 적으면 자주 써야겠다.
+ `vector` + `reserve()` - size를 대충이라도 알면 써야겠다. 그렇지 않으면 `deque`를 쓴다.
	+ 잘 정리한 [링크](https://novlog.tistory.com/4)
+ `deque` - 중간에서 삽입, 삭제할일이 있거나 덩어리가 큰 `struct`를 보관할때 써야겠다.
	+ 잘 정리한 [링크](https://novlog.tistory.com/entry/C-STL-Deque-Container-%EC%82%AC%EC%9A%A9-%EB%B0%A9%EB%B2%95-%EA%B4%80%EB%A0%A8-%EC%98%88%EC%A0%9C-%EC%B4%9D-%EC%A0%95%EB%A6%AC)
+ `unordered_map` - 삽입 삭제가 굉장히 빈번한 경우 hashmap으로 써야겠다.
+ `unordered_set` - 중복되는 데이터 따로 신경쓰기 귀찮을때 `vector`나 `deque` 대신 유용하게 쓸 수 있다.
+ 그 외: 아직 왜 써야하는지, 얻다 쓸지 찾지 못했다. 혹시 사용처가 생기게 되면 본 포스트에 지속적으로 예시와 함께 업데이트 할 예정

<br/>

### 참고
+ `vector` vs `list` vs `deque` 속도 비교 - [링크](https://baptiste-wicht.com/posts/2012/12/cpp-benchmark-vector-list-deque.html)
+ `vector` vs `deque`의 차이점 - [링크](https://uncertainty-momo.tistory.com/62#:~:text=%EA%B0%80%EC%9E%A5%20%EC%A4%91%EC%9A%94%ED%95%9C%20%EC%B0%A8%EC%9D%B4%EC%A0%90%EC%9D%80%20%EB%A9%94%EB%AA%A8%EB%A6%AC,%EA%B0%80%20%EC%97%B0%EC%86%8D%EB%90%98%EC%96%B4%20%EC%9E%88%EC%A7%80%20%EC%95%8A%EB%8B%A4.)
+ stl의 `queue`와 `stack`은 `deque`을 사용해서 구현되어있다고 한다.
	+ `queue` 정의 발췌, [링크](https://en.cppreference.com/w/cpp/container/queue)
	```cpp
template<
class T,
class Container = std::deque<T>
> class queue;
	```
	+ `stack` 정의 발췌, [링크](https://en.cppreference.com/w/cpp/container/stack)
	```cpp
template<
class T,
class Container = std::deque<T>
> class stack;
	```
+ `unordered_map`과 `map`의 차이 - [링크](https://stackoverflow.com/questions/2196995/is-there-any-advantage-of-using-map-over-unordered-map-in-case-of-trivial-keys), [링크2](https://www.geeksforgeeks.org/map-vs-unordered_map-c/)
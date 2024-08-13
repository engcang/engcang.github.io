var isMouseOverLink = false;
var isPopupActive = false;

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('section a[href^="/"], section a[href^="' + window.location.origin + '"]').forEach(function(link) {
        link.addEventListener('mouseover', function() {
            isMouseOverLink = true;
            fetch(link.getAttribute('href'))
                .then(response => response.text())
                .then(data => {
                    showPopup(link, data);
                });
        });

        link.addEventListener('mouseleave', function() {
            isMouseOverLink = false;
            setTimeout(function() {
                if (!isPopupActive) {
                    hidePopup();
                }
            }, 400); // 400ms 후에 팝업 숨김을 검사
        });
    });

    var popup = document.getElementById('linkPreviewPopup');
    popup.addEventListener('mouseover', function() {
        isPopupActive = true;
    });
    popup.addEventListener('click', function() {
        isPopupActive = true; // 클릭을 감지하여 팝업을 '활성화' 상태로 설정
    });
    popup.addEventListener('wheel', function() {
        isPopupActive = true; // 휠 이벤트를 감지하여 팝업을 '활성화' 상태로 설정
    });
    popup.addEventListener('mouseleave', function() {
        isPopupActive = false;
        setTimeout(function() {
            if (!isMouseOverLink) {
                hidePopup();
            }
        }, 400); // 400ms 후에 팝업 숨김을 검사
    });
    document.addEventListener('click', function(event) {
        if (!popup.contains(event.target)) {
            isPopupActive = false;
            hidePopup();
        }
    });
});

function showPopup(link, data) { // 여기에 팝업을 생성하고 데이터를 표시하는 코드를 작성합니다.
    var popup = document.getElementById('linkPreviewPopup');
    popup.classList.add('link-preview-popup');

    // 문자열을 HTML 문서로 파싱
    var parser = new DOMParser();
    var doc = parser.parseFromString(data, 'text/html');

    // <section> 태그의 내용만 추출
    var sectionContent = doc.querySelector('section');
    if (sectionContent) {
        popup.innerHTML = sectionContent.innerHTML;
    } else {
        popup.innerHTML = "<p>적절한 섹션이 없습니다.</p>";
    }

    // 링크 위치 근처에 팝업 표시
    var rect = link.getBoundingClientRect();
    popup.style.left = rect.left + 'px';
    popup.style.top = rect.bottom + 'px';
    popup.style.display = 'block';
}

function hidePopup() {  // 여기에 팝업을 숨기는 코드를 작성합니다.
    if (!isMouseOverLink && !isPopupActive) {
        var popup = document.getElementById('linkPreviewPopup');
        popup.style.display = 'none';
    }
}
document.addEventListener('presentationInit', function(){
	app.slide.user_stories = {
		onEnter: function(slideElement){
			if(!slideElement.isInit){
				this.onInit(slideElement);
				slideElement.isInit = true;
			}
		},
		onExit: function(){},
		onInit: function(slideElement){
			var video;
			slideElement.getElementsByClassName('video-thumbs').forEach(function(button){
				if(button.hasAttribute('data-ag-asset')){
					button.addEventListener('tap', function(){
							video = document.createElement('video');
							slideElement.appendChild(video);
							video.src = button.getAttribute('data-ag-asset');
							video.addEventListener("loadedmetadata", function(){
								this.webkitEnterFullscreen();
							});
							video.addEventListener("webkitendfullscreen", function(){
								slideElement.removeChild(this);
							});
							video.addEventListener("ended", function(){
								slideElement.removeChild(this);
							});
							if(video.load){
								video.load();
								video.play();
							}
					});
				}
			});
		}
	}
});
document.addEventListener('presentationInit', function(){
	app.slide.segmentation = {
		onEnter: function(slideElement){
			app.flow.unload();
			app.menu.hideChapters();
			if(!slideElement.isInit){
				slideElement.isInit = true;
				this.onInit(slideElement);
			}
		},
		onInit: function(slideElement){
			slideElement.getElementsByTagName('button').forEach(function(button, index){
				button.addEventListener('click', function(){
					app.flow.load(index + 1);
					setTimeout(function(){
						app.goTo(app.slideshow.id, app.flow.startSlide);
            ag.submit.event({
              category: 'Flow selection',
              categoryId: 'ag-remepan-flow',
              label: "Flow chosen",
              labelId: "chosen-flow",
              value: index + 1,
              valueType: "number",
              path: app.getPath()
            });
					}, 0);
				});
			});
		},
		onExit: function(){
		}
	}
});
require([
    "app",
    "backbone",
    "underscore",
    "views/loginView"
],
function(app,Backbone,_,loginview) {
	var test = new loginview()
	test.render();
});

/**
 * module for configuring node devices
 **/
RED.devices = (function() {

    $("#btn-set-device").on("mouseover",function(e) {
        e.preventDefault();
        RED.view.state(RED.state.DEVICE_DRAWING);
    });

    // add devices to the pop down
    function init(onselect, devices) {
        var topMenu = d3.select("#device-list");

        topMenu.selectAll('li')
            .data(devices)
            .enter().append('li').append('a').attr('href','#')
            .text(function (d){
                return d.label;
            })
            .on('click', function(d) {
                onselect(d);
            });
            
        topMenu.insert('li', ':first-child').append('a').attr('href','#')
            .text('Add new')
            .on('click', function(d) {
                RED.view.showConstraintDialog(addConstraint, onselect);
            });
    }
    
    
    function addConstraint(onselect, constraint){
        var topMenu = d3.select("#device-list");
        topMenu.append('li').append('a').attr('href','#')
            .text(constraint.constraintId)
            .on('click', function(d) {
                onselect(constraint);
            });
    }

    return {
        init:init,
        addConstraint: addConstraint
    };
})();

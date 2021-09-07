$(function(){

    let margin = {top: 100, right: 120, bottom: 20, left: 120};
    let width = 1000 - margin.right - margin.left;
    let height = 550 - margin.top - margin.bottom;

    let i = 0;
    let duration = 750;
    let root;

    let tree = d3.layout.tree()
        .size([width, height]);

    let diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.x, d.y]; });


    let svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let infoBox = d3.select("#info-container");

    d3.json("data.json", function(error, data) {
        root = data;
        root.y0 = 0;
        root.x0 = width/2;
        function collapse(d) {
            if (d.children) {
                d._children = d.children;
                d._children.forEach(collapse);
                d.children = null;
            }
        }

        root.children.forEach(collapse);
        update(root);
        updateInfo(root);
    });

    d3.select(self.frameElement).style("height", "800px");

    function update(source) {

        

        let nodes = tree.nodes(root),
            links = tree.links(nodes);

        
        nodes.forEach(function(d) {d.y = d.depth * 180; });
        console.log(nodes);

        // Update the nodes…
        let node = svg.selectAll("g.node")
            .data(nodes, function(d) { return d.id || (d.id = ++i); });
        console.log(node);

        
        let nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { return "translate(" + source.x0 + "," + source.y0 + ")"; })
            .on("click", function(d){click(d);});

        nodeEnter.append("circle")
            .attr("r", 1e-6)
            .attr("id", function(d) {return "node"+d.id; })
            .style("fill", function(d) { return d._children ? "#c98b8e" : "#fff"; })

        nodeEnter.append("text")
            .attr("font-family", "'Antic Slab', Helvetica, Arial, sans-serif")
            .attr("font-size","1.25em")
            .attr("x",function(d){return d.id==1?"2":"0"})
            .attr("dy", function(d){return d.id==1?"1em":"-.75em"})
            .attr("text-anchor", function(d){return d.id==1?"middle":"middle"})
            .text(function(d) { return d.name; })
            .style("fill-opacity", 1e-6);

        nodeEnter.append("svg:image")
            .attr("id",function(d){return "node"+d.id+"img"})
            .attr("xlink:href",function(d){return (d.image==null)?"":d.image})
            .attr("width",function(d){
                if (d.id==1){
                    return (d.image==null)?"1e-6":"100"
                }
                else
                    return (d.image==null)?"1e-6":"16"
            })
            .attr("height",function(d){
                if (d.id==1){
                    return (d.image==null)?"1e-6":"100"
                }
                else
                    return (d.image==null)?"1e-6":"16"
            })
            .attr("x",function(d){
                if (d.id==1){
                    return (d.image==null)?"1e-6":"-50"
                }
                else
                    return (d.image==null)?"1e-6":"-8"
            })
            .attr("y",function(d){
                if (d.id==1){
                    return (d.image==null)?"1e-6":"-100"
                }
                else
                    return (d.image==null)?"1e-6":"-8"
            })
        
        let nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

        nodeUpdate.select("circle")
            .attr("r", function(d){return d.image!=null?1e-6:4.5})
            .style("fill", function(d) { return (d._children) ? "#c98b8e" : "#fff"; });

        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        
        let nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) { return "translate(" + d.parent.x + "," + d.parent.y + ")"; })
            .remove();

        nodeExit.select("circle")
            .attr("r", 1e-6);

        nodeExit.select("text")
            .style("fill-opacity", 1e-6);

        
        let link = svg.selectAll("path.link")
            .data(links, function(d) { return d.target.id; });

        
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function(d) {
                let o = {x: source.x0, y: source.y0};
                return diagonal({source: o, target: o});
            });

        
        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        
        link.exit().transition()
            .duration(duration)
            .attr("d", function(d) {
                let o = {x: d.source.x, y: d.source.y};
                return diagonal({source: o, target: o});
            })
            .remove();

        
        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });

    }

    function updateInfo(x){
        let infoData = infoBox.selectAll(".infoBox").data((x.info!=null)?[x.info]:[]);
        let infoEnter = infoData.enter()
            .append("div")
            .attr("class","infoBox")
            .style("opacity","0")

        infoEnter.append("div").attr("class","infoAvatar").html(function(d){return "<img src="+d.avatar+"></img>"});
        infoEnter.append("div").attr("class","infoTitle").html(function(d){return d.title});
        infoEnter.append("div").attr("class","infoSubhead").html(function(d){return d.subhead});
        infoEnter.append("div").attr("class","infoText").html(function(d){return d.text})

        let infoUpdate = infoData.transition().duration(duration/2).style("opacity","0");
        infoUpdate.each("end",function(){
            infoData.select(".infoAvatar").html(function(d){
                if (d.avatar.length > 0) return "<img src="+d.avatar+"></img>";
            });
            infoData.select(".infoTitle").html(function(d){return d.title});
            infoData.select(".infoSubhead").html(function(d){return d.subhead});
            infoData.select(".infoText").html(function(d){return d.text});
        })
        infoUpdate.transition().duration(duration/2).style("opacity","1");



        infoData.exit()
            .transition()
            .duration(duration)
            .style("opacity","0")
            .remove();

        let infoLink = svg.selectAll("path.infolink")
            .data((x.info!=null)?[x]:[]);

        infoLink.enter().insert("path", "g")
            .attr("class", "infolink")
            .attr("d", function(d) {
                let o = {x: d.x, y: d.y};
                let targ = {x: width/2,y: height+30};
                return diagonal({source: o, target: o});
            });

        infoLink.transition()
            .duration(duration)
            .attr("d", function(d) {
                let o = {x: d.x, y: d.y};
                let targ = {x: width/2,y: height+30};
                return diagonal({source: o, target: targ});
            });

        
        infoLink.exit().transition()
            .duration(duration)
            .attr("d", function(d) {
                let targ = {x: width/2,y: height+30};
                let o = {x: x.x, y: x.y};
                return diagonal({source: targ, target: targ});
            })
            .remove();

    }

    
    function click(d) {
        
        if(d.parent!=undefined){
            for (let i=0;i<d.parent.children.length;i++){
                if (d.parent.children[i].id!=d.id){
                    if (d.parent.children[i].children) {
                        d.parent.children[i]._children = d.parent.children[i].children;
                        d.parent.children[i].children = null;
                    }
                }
            }
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }
        }
        update(d);
        updateInfo(d);
    }

});
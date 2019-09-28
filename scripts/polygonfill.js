var view;
var ctx;
var polygons = {
    convex: {
        color: '#f00202', // choose color here!
        vertices: [[150,150], [450,100],[550,300],[300,500],[200,500]
            // fill in vertices here!
        ]
    },
    concave: {
        color: '#48ff05', // choose color here!
        vertices: [ [150,150], [450,200],[460,300],[170,500],[150,400],[250,250]
            // fill in vertices here!
        ]
    },
    self_intersect: { 
        color: '#0576ff', // choose color here!
        vertices: [ [100, 200],[700,200],[600,500],[400,50],[200,500]
            // fill in vertices here!
        ]
    },
    interior_hole: {
        color: '#ff05d1', // choose color here!
        vertices: [[100,200],[700,200],[700,300],[400,400],[400,50],[600,275],[100,350]
            // fill in vertices here!
        ]
    }
};

// Init(): triggered when web page loads
function Init() {
    var w = 800;
    var h = 600;
    view = document.getElementById('view');
    view.width = w;
    view.height = h;

    ctx = view.getContext('2d');

    SelectNewPolygon();
}

// DrawPolygon(polygon): erases current framebuffer, then draws new polygon
function DrawPolygon(polygon) {
    // Clear framebuffer (i.e. erase previous content)
    ctx.clearRect(0, 0, view.width, view.height);

    // Set line stroke color
    ctx.strokeStyle = polygon.color;

    // Create empty edge table (ET)
    var edge_table = [];
    var i;
    for (i = 0; i < view.height; i++) {
        edge_table.push(new EdgeList());
    }

    // Create empty active list (AL)
    var active_list = new EdgeList();


    // Step 1: populate ET with edges of polygon
	for(i =0; i<polygon.vertices.length-1; i++){//adding edges to edge table
		if(polygon.vertices[i][1] > polygon.vertices[i+1][1]){
			ymax = polygon.vertices[i][1];
			xmin = polygon.vertices[i+1][0];
			deltax = polygon.vertices[i+1][0]-polygon.vertices[i][0];
			deltay = polygon.vertices[i+1][1]-polygon.vertices[i][1];
		}
		else{
			ymax = polygon.vertices[i+1][1];
			xmin = polygon.vertices[i][0];
			deltax = polygon.vertices[i+1][0]-polygon.vertices[i][0];
			deltay = polygon.vertices[i+1][1]-polygon.vertices[i][1];
		}
		edge_table[Math.min(polygon.vertices[i][1], polygon.vertices[i+1][1])]
		.InsertEdge(new EdgeEntry(ymax,xmin,deltax,deltay));
	}
	//adding the last vertex to the first vertex
	if(polygon.vertices[polygon.vertices.length-1][1] > polygon.vertices[0][1]){
		ymax = polygon.vertices[polygon.vertices.length-1][1];
		xmin = polygon.vertices[0][0];
		deltax = polygon.vertices[0][0]-polygon.vertices[polygon.vertices.length-1][0];
		deltay = polygon.vertices[0][1]-polygon.vertices[polygon.vertices.length-1][1];
	}
	else{
		ymax = polygon.vertices[0][1];
		xmin = polygon.vertices[polygon.vertices.length-1][0];
		deltax = polygon.vertices[0][0]-polygon.vertices[polygon.vertices.length-1][0];
		deltay = polygon.vertices[0][1]-polygon.vertices[polygon.vertices.length-1][1];
	}
	edge_table[Math.min(polygon.vertices[polygon.vertices.length-1][1], polygon.vertices[0][1])]
	.InsertEdge(new EdgeEntry(ymax,xmin,deltax,deltay));


    // Step 2: set y to first scan line with an entry in ET
	var y=0;
	while(edge_table[y].first_entry == null)
	{
		y++;
	}
	
	/* Infinite while loop
	1. It seems to work for the first non-null y
	2. Do we insert edges into edge table once we finish manipulating them?
	3. That does not seem to work either, will get infinite while loops during this time
	4. Not entirely sure how to update the active_list with the edge_table at spot y
	5. Not sure how to define vertices for interior_hole
	6. Not sure if we draw lines between vertices and then fill?
	*/
	while((edge_table[y].first_entry != null) || (active_list.first_entry != null)){
		
		let entry1= edge_table[y].first_entry;
		
		while(entry1 != null)
		{
			active_list.InsertEdge(entry1);
			entry1 = entry1.next_entry;			
		}
		
		active_list.SortList();//b
		active_list.RemoveCompleteEdges(y);
				
		var curr_entry= active_list.first_entry;
		
		while(curr_entry != null){
			let second_entry= curr_entry.next_entry;
			var x1 = curr_entry.x;
			var x2 = second_entry.x;
			x2= Math.ceil(x2)-1;
			x1= Math.ceil(x1);				
			if(x1 <= x2)
			{
				DrawLine(x1, y, x2, y);
			}
			else{}//do nothing
			curr_entry.x = curr_entry.x + curr_entry.inv_slope;
			second_entry.x = second_entry.x + second_entry.inv_slope;			
			curr_entry = second_entry.next_entry;	
		}
		y++;		
		
	}
    // Step 3: Repeat until ET[y] is NULL and AL is NULL
    //   a) Move all entries at ET[y] into AL
    //   b) Sort AL to maintain ascending x-value order
    //   c) Remove entries from AL whose ymax equals y
    //   d) Draw horizontal line for each span (pairs of entries in the AL)
    //   e) Increment y by 1
    //   f) Update x-values for all remaining entries in the AL (increment by 1/m)
}

// SelectNewPolygon(): triggered when new selection in drop down menu is made
function SelectNewPolygon() {
    var polygon_type = document.getElementById('polygon_type');
    DrawPolygon(polygons[polygon_type.value]);
}

function DrawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}



(()=>{

    let new_demo = function(test_name){
        let demo = this;
        demo.description = '';
        demo.grid_initialize = function(grid){};
        demo.add_to_page = function(){
            let div = document.createElement('div');
            div.id = test_name + '_div';
            
            let p = document.createElement('p');
            p.innerHTML = demo.description;
            div.appendChild(p);
            
            let grid_div = document.createElement('div');
            grid_div.id = test_name + '_grid';
            div.appendChild(grid_div);
            let grid = new Gridify(grid_div);
            demo.grid_initialize(grid);
            
            let pre = document.createElement('pre');
            pre.style = 'font-size:10pt;overflow:auto; max-height:400px';
            div.appendChild(pre);
            let code = document.createElement('code');
            code.id = test_name + '_code';
            code.className = 'language-javascript';
            code.innerHTML = demo.grid_initialize.toString();
            pre.appendChild(code);

            Prism.highlightElement(code);
            document.body.appendChild(div);
        }
        return demo;
    }

    let x = 0; let y = 25;
    let rand = () => Math.floor(Math.random() * ((y-x)+1) + x);
    let data = [];
    for(let i = 0; i < 500; i++)
        data.push({ ColA : 'abcdefghijklmnopqrstuvwxyz'[rand()] });
    
    
    let performance_test = new_demo('performance_test');
    performance_test.description = `In my 'production' site, I am noticing that 
        filtering hitches on my spells table, which contains a couple hundred records. 
        Going to try and re-create that here to start tuning it.
        <br>* The first approach was to add paging. It was a feature that I wanted anyways 
        and there's the chance that the performance issue was caused by redraw events on 
        visible objects. 
        <br>* Diagnosing: Create a table with 500 rows of a single letter each. There 
        is a noticeable hitch when filtering even there. Attaching a timer to it, we have 
        around 700ms to filter 500 single letters (!), compared to the 70ms to sort the 
        whole thing. So something is definitely wrong. 
        <br>* The culprit was retrieving cell values inside the loops. Solution is to get 
        all the grid data into a json object and access it there.`;
    performance_test.grid_initialize = function(grid) {
        grid.initialize({
            columns : [ { field : 'ColA', sort : true, filter : true } ],
            data : data, 
            paging : true
        });
    }
    performance_test.add_to_page();

})();





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

    let style_demo = new_demo('style_test');
    style_demo.description = `Testing css and class overrides.`;
    style_demo.grid_initialize = function(grid) {
        grid.initialize({
            columns : [
                { field : 'a', header : 'Default Col' }
                , { field : 'b', header : 'Col Style', style : 'background: teal' }
            ],
            data : [
                { a : 1, b : 'a' }, { a : 2, b : 'b' }, { a : 3, b : 'c' }
            ],
            style : `border: solid thin black;`,
            className : 'style_demo'
        });
    }
    style_demo.add_to_page();

    let base_demo = new_demo('base_test');
    base_demo.description = `Basic grid demonstrating data binding`;
    base_demo.grid_initialize = function(grid){
        grid.initialize({
            columns : [
                { field : 'a' } // Basic Column 
                , { field : 'b', header : 'Header Text' }
            ],
            data : [
                { a : 'a', b : 1 },
                { a : 'b', b : 2 },
                { a : 'c', b : 3 }
            ]
        });
    }
    base_demo.add_to_page();

    let sort_demo = new_demo('sort_test');
    sort_demo.description = `Demonstration of sort functionality. Default sort is alphabetical. The custom 
        sort uses a custom comparator that sorts alphabetically, but skips the first two characters.`;
    sort_demo.grid_initialize = function(grid){
        // Custom sort. Ignore char: prefix.
        let comparator = function(a, b){
            return a.substr(2) >= b.substr(2) ? 1 : -1
        }

        grid.initialize({
            columns : [
                { field : 'Default', header : 'Default Sort', sort : true },
                { field : 'Custom', sort : { comparator : comparator }}
            ],
            data : [
                { Default : 'alpha', Custom : 'W:Delta' },
                { Default : 'beta' , Custom : 'X:Charlie' }, 
                { Default : 'charlie', Custom : 'W:Beta' },
                { Default : 'delta', Custom : 'Z:Alpha' }
            ]
        });

    }
    sort_demo.add_to_page();

    let filter_demo = new_demo('filter_test');
    filter_demo.description = `Demonstration of filters. 
        <br>Default filtering is value% wildcard. So typing in 00 will filter to 3 items, while typing 
        01 will filter to 1.
        <br>The custom filter uses a %value% rule so typing in 'l' will filter to 3 items, while typing 
        in 'p' will filter to 1. 
        <br>We can also set a custom control to filter with. The rule compares the value of the cell against 
        the value of the control. Here, if checked, we want only records where 'Bit' is 1. Else we want all records.`;
    filter_demo.grid_initialize = function(grid){
        let custom_filter = function(cell_value, filter_value){
            return cell_value.includes(filter_value);
        }

        let chk = document.createElement('input');
        chk.type = 'checkbox'
        chk.onclick = function(e) {  e.target.value = e.target.checked; }

        grid.initialize({
            columns : [
                { field : 'Default', filter : true },
                { field : 'Custom', filter : { rule : custom_filter } },
                { field : 'Bit', filter : {
                    control : chk,
                    rule : function(bit, is_checked) { 
                        return is_checked == 'true' ? bit==1 : true;
                    },
                    event : 'click'
                }}
            ],
            data : [
                { Default : '0001', Custom : 'alpha', Bit : 1 },
                { Default : '0010' , Custom : 'beta', Bit : 1 }, 
                { Default : '0011', Custom : 'charlie', Bit : 0 },
                { Default : '0100', Custom : 'delta', Bit : 0 }
            ]
        })
    }
    filter_demo.add_to_page();

    let paging_demo = new_demo('paging_test');
    paging_demo.description = `Demonstration of paging.
        It defaults to paging 20 rows at a time, which can be overridden with the 'rows' option. `;
    paging_demo.grid_initialize = function(grid){
        grid.initialize({
            columns : [
                { field : 'n' }
            ],
            data : [
                { n : 1 }, { n : 2 }, { n : 3 }, { n : 4 },
                { n : 5 }, { n : 6 }, { n : 7 }, { n : 8 },
                { n : 9 }, { n : 10 }, { n : 11 }, { n : 12 },
                { n : 13 }, { n : 14 }, { n : 15 }, { n : 16 },
                { n : 17 }, { n : 18 }, { n : 19 }, { n : 20 },
                { n : 21 }, { n : 22 }, { n : 23 }, { n : 24 },
                
            ],
            paging : { rows : 6 } 
        });
    }
    paging_demo.add_to_page();


    let integration_demo = new_demo('integration_test');
    integration_demo.description = `Integration of sorting, paging, and filtering. 
        <br>Sorting needs to trigger the pager to refresh while maintaining the current page.
        <br>Filtering needs to trigger the pager to refresh while setting current page to 1.
        <br>Paging needs to page over filtered items.`;
    integration_demo.grid_initialize = function(grid){
        grid.initialize({
            columns : [
                { field : 'bin', header : 'Nybble', filter : true, sort: true }
            ],
            data : [
                { bin : '0001' },{ bin : '0010' },{ bin : '0011' },
                { bin : '0100' },{ bin : '0101' },{ bin : '0110' },
                { bin : '0111' },{ bin : '1000' },{ bin : '1001' },
                { bin : '1010' },{ bin : '1011' },{ bin : '1100' },
                { bin : '1101' },{ bin : '1110' },{ bin : '1111' },
            ],
            paging : { rows : 5 },
        
        });
    }
    integration_demo.add_to_page();


})();



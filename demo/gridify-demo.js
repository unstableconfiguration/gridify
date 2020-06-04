

(() => {

    let demo = function(options) {
        let demo = this;
        
        let div = document.createElement('div');
        div.id = options.name + '-div';

        let p = document.createElement('p');
        p.innerHTML = options.description;
        div.appendChild(p);

        demo.container = document.createElement('div');
        demo.container.id = options.name + '-container';
        div.appendChild(demo.container);

        let pre = document.createElement('pre');
        pre.style = 'font-size:10pt; overflow:auto; max-height:400px';
        div.appendChild(pre);

        let code = document.createElement('code');
        code.id = options.name + '-code';
        code.className = 'language-javascript';
        code.innerHTML = options.initialize.toString();
        pre.appendChild(code);

        Prism.highlightElement(code);
        document.body.appendChild(div);
    
        options.initialize();

        return demo;
    }

    demo({
        name : 'minimal-demo',
        description : `Bare minimum grid databinding. With nothing but a data source, 
            it creates a basic table.`,
        initialize : function() {
            let grid = new Gridify({
                data : [
                    { a : 'a', b : 1 },
                    { a : 'b', b : 2 },
                    { a : 'c', b : 3 }
                ]
            });
            document.getElementById('minimal-demo-container')
                .appendChild(grid.html);
        }
    });

    demo({
        name : 'basic-demo',
        description : `Basic grid databinding with headers and column definitions.
            The column definitions define which data to bind.`,
        initialize : function() {
            new Gridify({
                container : 'basic-demo-container',
                headers : [ { text : 'Header 1' }, 'Header 2'],
                columns : [ { field : 'a' }, { field : 'b'} ],
                data : [
                    { a : 'a', b : 1 },
                    { a : 'b', b : 2 },
                    { a : 'c', b : 3 }
                ]
            });
        }
    });

    demo({
        name : 'style-demo',
        description : `Setting .classname and .style of elements. CSS classes and .style attributes
            can be applied to the <table> element, the <th> header cells, and the <td> data cells`,
        initialize : function() {
            let grid = new Gridify({
                headers : [ 
                    { text : 'Styled Header', style : 'text-decoration:underline;' }, 
                    { text : 'Classed Header', className : 'blue' } 
                ],
                columns : [ 
                    { field : 'a', style : 'background-color:khaki;' }, 
                    { field : 'b', className : 'italic' } 
                ],
                data : [
                    { a : 1, b : 'a' }, { a : 2, b : 'b' }, { a : 3, b : 'c' }
                ],
                style : `border: solid thin black;`,
                className : 'style-demo'
            });
            document.getElementById('style-demo-container')
                .appendChild(grid.html);
        }
    });

    demo({
        name : 'sorting-demo',
        description : `Demonstration of sorting. Default sorting is alphabetical/unicode sorting. 
            A custom sort comparison function can be provided to have more refined behavior.`,
        initialize : function() {
            // Ignore 2-character prefix
            let comparer = function(a, b) {
                return a.substr(2) >= b.substr(2) ? 1 : -1;
            }

            let grid = new Gridify({
                container : 'sorting-demo-container',
                headers : [ 
                    { text : 'Default Sort', sort : true },
                    { text : 'Custom Sort', sort : comparer }
                ],
                columns : [
                    { field : 'Default' },
                    { field : 'Custom' }
                ],
                data : [
                    { Default : 'alpha', Custom : 'W:Delta' },
                    { Default : 'beta' , Custom : 'X:Charlie' }, 
                    { Default : 'charlie', Custom : 'W:Beta' },
                    { Default : 'delta', Custom : 'Z:Alpha' }
                ]
            });
        }
    });

    demo({
        name : 'filter-demo',
        description : `Demonstration of filters. 
            <br>Default filtering is value% wildcard. So typing in 00 will filter to 3 items, while typing 
            01 will filter to 1.
            <br>The custom filter uses a %value% rule so typing in 'l' will filter to 3 items, while typing 
            in 'p' will filter to 1. 
            <br>We can also set a custom control to filter with. The rule compares the value of the cell against 
            the value of the control. Here, if checked, we want only records where 'Bit' is 1. Else we want all records.`,
        initialize : function() {
            let customFilter = function(cellValue, filterValue) {
                return cellValue.includes(filterValue);
            }

            let chk = document.createElement('input');
            chk.type = 'checkbox';
            chk.onclick = function(e) { 
                e.target.value = e.target.checked; }

            new Gridify({
                container : 'filter-demo-container',
                headers : [
                    { text : 'Default', filter : true },
                    { text : 'Custom Filter', filter : customFilter },
                    { text : 'Custom Control', filter : {
                        control : chk,
                        rule : function(bitValue, isChecked) { 
                            return isChecked == 'true' ? !!+bitValue : true;
                        },
                        event : 'click'
                    } }
                ],
                columns : [
                    { field : 'Default' },
                    { field : 'Custom' },
                    { field : 'Bit' }
                ],
                data : [
                    { Default : '0001', Custom : 'alpha', Bit : 1 },
                    { Default : '0010' , Custom : 'beta', Bit : 1 }, 
                    { Default : '0011', Custom : 'charlie', Bit : 0 },
                    { Default : '0100', Custom : 'delta', Bit : 0 }
                ]
            });
        }
    });

    demo({
        name : 'paging-demo', 
        description : `Demonstration of paging.
            It defaults to paging 20 rows at a time, which can be overridden 
            with the 'rows' option.`,
        initialize : function() {
            new Gridify({
                container : 'paging-demo-container',
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
    });

    demo({
        name : 'integration-demo',
        description : `Integration of sorting, paging, and filtering. 
            <br>Sorting needs to trigger the pager to refresh while maintaining the current page.
            <br>Filtering needs to trigger the pager to refresh while setting current page to 1.
            <br>Paging needs to page over filtered items.`,
        initialize : function() {
            new Gridify({
                container : 'integration-demo-container',
                headers : [ { text : 'Nybble' , filter : true, sort : true } ],
                columns : [ { field : 'bin' } ],
                data : [
                    { bin : '0001' },{ bin : '0010' },{ bin : '0011' },
                    { bin : '0100' },{ bin : '0101' },{ bin : '0110' },
                    { bin : '0111' },{ bin : '1000' },{ bin : '1001' },
                    { bin : '1010' },{ bin : '1011' },{ bin : '1100' },
                    { bin : '1101' },{ bin : '1110' },{ bin : '1111' },
                ],
                paging : { rows : 5 }
            });
        }
    });

    // integration fail
    // paging is not iterating the pager number
    // the filter is removing the pagination

})();



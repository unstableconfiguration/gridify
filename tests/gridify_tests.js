

describe('Gridify Tests', function(){
    let assert = chai.assert;
    
    let newgrid = function(id){
        let div = document.createElement('div');
        div.id = id;
        div.style.display = 'none';
        document.body.appendChild(div);
        return new Gridify(id);
    }
    
    describe('Initialization', function(){
        it('Initializes html table into a provided div')
    });

    describe('Column definitions', function(){
        it('Defaults header text to field text if not specified', function(){
            let grid = newgrid('column_definitions_test_1');
            grid.initialize({
                data : [ { Col : 'a' } ]
                , columns : [{ field : 'Col' }]
            });
            assert.isTrue(grid.header.cells()[0].firstChild.innerHTML == 'Col')
        });
        it('Allows header text to be set with "header" property', function(){
            let grid = newgrid('column_definitions_test_2');
            grid.initialize({
                data : [ { Col : 'a' } ]
                , columns : [{ field : 'Col', header:'test' }]
            });
            assert.isTrue(grid.header.cells()[0].firstChild.innerHTML == 'test')
        });

    });6

    describe('CSS', function() {
        it('Should set the style property of the html table when .style is supplied in the grid definition', function() {
            let grid = newgrid('css_table_style_test');
            grid.initialize({
                columns : [ { field : 'col' } ],
                data : [ { col : 'a' } ],
                style : 'border: solid thin blue;'
            });
            assert.isTrue(grid.table.style.border === 'thin solid blue');
        });

        it('Should set the class property of the html table when .class supplied in the grid definition', function() {
            let grid = newgrid('css_table_class_test');
            grid.initialize({
                columns : [ { field : 'col' } ],
                data : [ { col : 'a' } ],
                class : 'testClass'
            });
            assert.isTrue(grid.table.className.includes('testClass'));    
        });

        it('Should set the style property of the column cells when .style is supplied in the column definition', function() {
            let grid = newgrid('css_cell_style_test');
            grid.initialize({
                columns : [ { field : 'col', style : 'background: blue' } ],
                data : [ { col : 'a' } ],
            });
            let cell = grid.body.rows[0].cells[0];
            assert.isTrue(cell.style.backgroundColor == 'blue');
        });
        it('Should set the class property of the column cells when .class is supplied in the column definition');
        it('Should set the style property of the header cell when .header.style is supplied in the column definition');
        it('Should set the class property of the header cell when .header.class is supplied in the column definition');


        it('Allows header style defaults to be overridden.', function(){
            let grid = newgrid('column_definitions_test_3');
            grid.initialize({
                data : [ { Col : 'a' } ]
                , columns : [{ field : 'Col', header_style : 'color:blue' }]
            });
            assert.isTrue(grid.header.cells()[0].style.color == 'blue')
        });
        it('Allows column style defaults to be overridden', function(){
            let grid = newgrid('column_definitions_test_4');
            grid.initialize({
                data : [ { Col : 'a' } ]
                , columns : [{ field : 'Col', style : 'color:blue' }]
            });
            assert.isTrue(grid.body.rows[0].cells[0].style.color == 'blue')
        });

    });

    describe('Data access', function(){
        it('Can modify a cell\'s value');
        it('Can modify a row\'s value');

        it('Allows the table data to be set after initialization', function(){
            let grid = newgrid('data_access_test_3.1');
            grid.initialize({
                columns : [ { field : 'Col ' } ]
            });
            assert.isTrue(grid.body.rows.length == 0);
            grid.data.set([{ Col : 'a' }]);
            assert.isTrue(grid.body.rows.length == 1);
        });// 3.1
        it('Allows the table data to be reset outside of initialization', function(){
            let grid = newgrid('data_access_test_3');//3.2
            grid.initialize({
                columns : [{field : 'Col'}],
                data : [{ Col : 'a' }]
            });
            assert.isTrue(grid.body.rows.length == 1);

            grid.data.set([{ Col : 'b' }, { Col : 'c' }]);
            assert.isTrue(grid.body.rows.length == 2);
        });
        it('Can retrieve a cell value from the table', function(){
            let grid = newgrid('data_access_test_4');
            grid.initialize({
                columns : [ { field : 'ColA' }, { field : 'ColB' } ],
                data : [ { ColA : 'a', ColB : 'b' }, { ColA : 1, ColB : 2 } ]
            });
            assert.isTrue(grid.data.get_cell_value(1,'ColB') == 2)
        });
        it('Can retrieve a data row from the table', function(){
            let grid = newgrid('data_access_test_5');
            grid.initialize({
                columns : [ { field : 'ColA'}, { field : 'ColB'} ],
                data : [{ ColA : 'a', ColB : 'b'}, { ColA : 'aa', ColB : 'bb'} ]
            });
            let second_row = grid.body.rows[1];
            let second_row_data = grid.data.get_row_data(second_row);
            assert.isTrue(second_row_data.ColB === 'bb')
        });
        it('Can retrieve a data set from the table', function(){
            let grid = newgrid('data_access_test_6');
            let data = [ { Col : 'a'}, { Col : 'b'}, { Col : 'c'} ];
            grid.initialize({
                columns : [ { field : 'Col'} ],
                data : data
            });
            let grid_data = grid.data.get();
            assert.isTrue(grid_data !== data); // not a reference to the same object 
            assert.isTrue(JSON.stringify(grid_data) === JSON.stringify(data)); // same values
        });
    });



    describe('Integration', function(){
        it('Repages after a row has been sorted, preserving the current page', function(){
            let grid = newgrid('integration_test_1');
            grid.initialize({
                columns : [ { field : 'Col', sort : true }  ],
                data : [ { Col : 'a' }, { Col : 'b' }, { Col : 'c' }],
                paging : { rows : 2 }
            });
            assert.isTrue(grid.body.rows[0].innerText === 'a');
            grid.paging.page(2);
            let get_visible_value = function(){
                return grid.body.rows.find(r => r.style.display === '').innerText;
            }
            assert.isTrue(get_visible_value() === 'c');
            grid.sorting.sort('Col'); grid.sorting.sort('Col');
            assert.isTrue(get_visible_value() === 'a');       
        });
        it('Repages after a filter has been applied', function(){
            let grid = newgrid('integration_test_2');
            grid.initialize({
                columns : [ { field : 'Col', filter : true }  ],
                data : [ { Col : 'a' }, { Col : 'a' }, { Col : 'c' }],
                paging : { rows : 2 }
            });
            grid.paging.page(2);
            assert.isTrue(grid.body.rows.filter(r => r.style.display === '').length === 1);
            let filter_textbox = grid.table.tHead.rows[1].cells[0].firstChild;
            filter_textbox.value = 'a';
            grid.filtering.filter();
            assert.isTrue(grid.table.options.paging.current_page === 1);
            assert.isTrue(grid.body.rows.filter(r => r.style.display === '').length === 2);

        });
    })

});

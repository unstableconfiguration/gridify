let assert = chai.assert;

describe('Gridify Tests', function(){

    let newgrid = function(id){
        let div = document.createElement('div');
        div.id = id;
        div.style.display = 'none';
        document.body.appendChild(div);
        return Gridify(id);
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
            assert.isTrue(grid.body.rows()[0].cells[0].style.color == 'blue')
        });
    });

    describe('Data access', function(){
        // can we set the data for the row independent of the initialization?
            // I think the idea is there, we set the ghost row to hold the style info 
        it('Allows the table data to be set outside of initialize', function(){
            let grid = newgrid('data_access_test_1');
            grid.initialize({
                columns : [{field : 'Col'}],
                data : [{ Col : 'a' }]
            });
            assert.isTrue(grid.body.rows().length == 1);

            grid.data.set([{ Col : 'b' }, { Col : 'c' }]);
            assert.isTrue(grid.body.rows().length == 2);
        });
        // not implemented
        it('Can retrieve a data set from the table');
        it('Can retrieve a data row from the table');
        it('Can retrieve a cell value from the table');
        it('Can modify a cell\'s value');

    });

    describe('Sorting', function(){
        it('Appends a sort icon on sortable columns', function(){
            let grid = newgrid('sorting_test_1');
            grid.initialize({
                columns : [{field : 'Col', sort : true }],
                data : [{ Col : 'a' }]
            });
            assert.isTrue(grid.header.cells()[0].children[1].className == 'sort');
        });
        it('Defaults to alphabetical sorting.', function(){
            let grid = newgrid('sorting_test_2');
            grid.initialize({
                columns : [{field : 'Col', sort : true }],
                data : [{ Col : 'b' }, { Col : 'c' }, { Col : 'a' }]
            });
            assert.isTrue(grid.data.get_cell_value(0, 'Col') == 'b');
            assert.isTrue(grid.data.get_cell_value(2, 'Col') == 'a');
            grid.sorting.sort('Col');
            assert.isTrue(grid.data.get_cell_value(0, 'Col') == 'a');
            assert.isTrue(grid.data.get_cell_value(2, 'Col') == 'c');
            grid.sorting.sort('Col'); // reverse
            assert.isTrue(grid.data.get_cell_value(0, 'Col') == 'c');
            assert.isTrue(grid.data.get_cell_value(2, 'Col') == 'a');  
        });
        it('Allows for custom sorting if sort function is provided.', function(){
            let grid = newgrid('sorting_test_3');
            // custom comparator: separates evens from odds before numeric sorting
            let comparator = function(a, b){
                let aeven = (a%2 == 0);
                let beven = (b%2 == 0);

                if(aeven && beven) return a <= b ? 1 : -1;
                if(aeven && !beven) return 1;
                if(!aeven && beven) return -1;
                if(!aeven && !beven) return a <= b ? 1 : -1;
            }
            
            grid.initialize({
                columns : [{field : 'Col', sort : { comparator : comparator } }],
                data : [{ Col : 2}, { Col : 3 }, { Col : 1 }, { Col : 4 }]
            });
            // ascending: 2, 4, 1, 3; descending: 3, 1, 4, 2
            grid.sorting.sort('Col', { comparator : comparator });   
            assert.isTrue(grid.data.get_cell_value(0, 'Col') == 2);
            assert.isTrue(grid.data.get_cell_value(2, 'Col') == 1);
            grid.sorting.sort('Col', { comparator : comparator });   
            assert.isTrue(grid.data.get_cell_value(0, 'Col') == 3);
            assert.isTrue(grid.data.get_cell_value(2, 'Col') == 4);     
        });
    });

    describe('Filtering', function(){
        it('Adds a filter textbox on filterable columns');
        it('Defaults to xyz% filtering function');
        it('Allows for custom filter control');
        it('Allows for custom filter logic')
    });

    describe('Paging', function(){
        it('Limits visible results when paging is true');
        it('')

    });

});


describe('Sorting', function(){
    let assert = chai.assert;

    let newgrid = function(id){
        let div = document.createElement('div');
        div.id = id;
        div.style.display = 'none';
        document.body.appendChild(div);
        return new Gridify(id);
    }

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
            columns : [{ field : 'Col', sort : true }],
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

    let comparator = function(a, b) { 
        return +a[1] <= +b[1] ? 1 : -1;
    }

    it('Allows for custom sorting if sort options are provided with comparator function.', function(){
        let grid = newgrid('sorting_test_3');      
        grid.initialize({
            columns : [{field : 'Col', sort : { comparator : comparator } }],
            data : [{ Col : 'a3' }, { Col : 'b2' }, { Col : 'c1' }]
        });
        // ascending: c1, b2, a3; descending: a3, b2, c1
        grid.sorting.sort('Col', { comparator : comparator });   
        console.log(grid.data.get_cell_value(0, 'Col'))
        assert.isTrue(grid.data.get_cell_value(0, 'Col') == 'c1');
        grid.sorting.sort('Col', { comparator : comparator });   
        assert.isTrue(grid.data.get_cell_value(0, 'Col') == 'a3');     
    });

    it('Allows for custom sorting if sort function is provided.', function(){
        let grid = newgrid('sorting_test_3');      
        grid.initialize({
            columns : [{field : 'Col', sort : comparator }],
            data : [{ Col : 'a3' }, { Col : 'b2' }, { Col : 'c1' }]
        });
        // ascending: c1, b2, a3; descending: a3, b2, c1
        grid.sorting.sort('Col', { comparator : comparator });   
        assert.isTrue(grid.data.get_cell_value(0, 'Col') == 'c1');
        grid.sorting.sort('Col', { comparator : comparator });   
        assert.isTrue(grid.data.get_cell_value(0, 'Col') == 'a3');     
    });

});
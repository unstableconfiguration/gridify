
export const SortingTests = function() {
    describe('Sorting', function(){
        let assert = chai.assert;

        let newgrid = function(id){
            let div = document.createElement('div');
            div.id = id;
            div.style.display = 'none';
            document.body.appendChild(div);
            return new Gridify(id);
        }

        it('Appends a sort icon on sortable columns', function() {
            let grid = new Gridify({
                columns : [ { sort : true, header : 'Col' } ]
            });
            assert.isTrue(grid.html.tHead.rows[0].cells[0].children[0].className == 'sort');
        });

        it('Defaults to alphabetical sorting.', function() {
            let grid = new Gridify({
                columns : [ { field : 'Col', sort : true, header : 'col' } ],
                data : [{ Col : 'b' }, { Col : 'c' }, { Col : 'a' }]
            });
            let data = grid.data.get();
            assert(data[0].Col === 'b' && data[2].Col === 'a');
            grid.sorting.sort('Col');
            data = grid.data.get();
            assert(data[0].Col === 'a' && data[2].Col === 'c');
            grid.sorting.sort('Col'); // reverse
            data = grid.data.get();
            assert(data[0].Col === 'c' && data[2].Col === 'a');
        });

        let compare = function(a, b) { 
            return +a[1] <= +b[1] ? 1 : -1;
        }

        it('Allows for custom sorting if sort option is a comparer function', function(){
            let grid = newgrid({
                columns : [ { field : 'Col', header : 'Col', sort : compare } ],
                data : [ { Col : 'a3' }, { Col : 'b2' }, { Col : 'c1' } ]
            });      
            
            grid.sorting.sort('Col');   
            assert.isTrue(grid.data.get()[0].Col == 'c1');
            grid.sorting.sort('Col');   
            assert.isTrue(grid.data.get()[0].Col == 'a3');     
        });

    });
}
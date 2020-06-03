
describe('Filtering', function(){
    let assert = chai.assert;
    
    let newgrid = function(id){
        let div = document.createElement('div');
        div.id = id;
        div.style.display = 'none';
        document.body.appendChild(div);
        return new Gridify(id);
    }

    it('Adds a filter textbox on filterable columns', function() {
        let grid = new Gridify({
            headers : [ { text : 'Col', filter : true } ],
            columns : [ { field : 'Col' } ],
            data : [ { Col : 'a' } ]
        });
        assert.isTrue(grid.html.tHead.rows[1].cells[0].firstChild != undefined);
    });
    it('Defaults to xyz% filtering function', function(){
        let grid = new Gridify({
            headers : [ { text : 'Col', filter : true } ],
            columns : [ { field : 'Col' } ],
            data : [ { Col : 'aab' }, { Col : 'abc' }, { Col : 'bca'}]
        });

        let filterTextbox = grid.html.tHead.rows[1].cells[0].firstChild;
        filterTextbox.value = 'a';
        grid.filtering.filter();
        assert.isTrue(
            Array.from(grid.html.tBodies[0].rows)
                .filter(r => r.style.display == 'none').length == 1
        );
        filterTextbox.value = 'aa';
        grid.filtering.filter();
        assert.isTrue(
            Array.from(grid.html.tBodies[0].rows)
                .filter(r => r.style.display == 'none').length == 2
        );
    });
    it('Applies all filters to the data set', function() {
        let grid = new Gridify({
            headers : [ { text : 'Col A', filter : true }, { text : 'Col B', filter : true} ],
            columns : [ { field : 'ColA' }, { field : 'ColB' } ],
            data : [ 
                { ColA : 'a', ColB : 'a' }, 
                { ColA : 'a', ColB : 'b' }, 
                { ColA : 'b', ColB : 'a' },
                { ColA : 'b', ColB : 'b' } ]
        });

        grid.html.tHead.rows[1].cells[0].firstChild.value = 'a';
        grid.html.tHead.rows[1].cells[1].firstChild.value = 'b';
        grid.filtering.filter();
        assert.isTrue(
            Array.from(grid.html.tBodies[0].rows)
                .filter(r => r.style.display == 'none').length == 3
        );
    });
    it('Allows for custom filter logic', function() {
        let grid = new Gridify({
            headers : [ { text : 'Col A', filter : { 
                rule : (cellValue, filterValue) => {
                    return cellValue.includes(filterValue);
                }
            }}],
            columns : [ { field : 'Col' } ],
            data : [ { Col : 'abcd' }, { Col : 'dcba' } ]
        });

        grid.html.tHead.rows[1].cells[0].firstChild.value = 'bc';
        grid.filtering.filter();
        assert.isTrue(
            Array.from(grid.html.tBodies[0].rows)
                .filter(r => r.style.display == 'none').length == 1
        );
    });
    it('Allows for custom filter control', function() {
        let ddl = document.createElement('select');
        let s0 = document.createElement('option');
        s0.value = 0; s0.innerHTML = 'zero';
        ddl.appendChild(s0);
        let s1 = document.createElement('option');
        s1.value = 1; s1.innerHTML = 'one'
        ddl.appendChild(s1);
        let s2 = document.createElement('option');
        s2.value = 2; s2.innerHTML = 'two'
        ddl.appendChild(s2);
        
        let grid = new Gridify({
            headers : [ { text : 'Col A', 
                filter : {
                    control : ddl,
                    rule : function(cellValue, filterValue) {
                        if(+filterValue === 0) { return true; }
                        return +filterValue === +cellValue;
                    },
                    event : 'change'
                }
            } ], 
            columns : [ { field : 'Col' } ],
            data : [ { Col : 1 }, { Col : 2 }, { Col : 3 } ]
        });

        grid.html.tHead.rows[1].cells[0].firstChild.value = 1;
        grid.filtering.filter();
        assert.isTrue(
            Array.from(grid.html.tBodies[0].rows)
                .filter(r => r.style.display == 'none').length == 2);
    });
});


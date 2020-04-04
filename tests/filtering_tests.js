
describe('Filtering', function(){

    
    let newgrid = function(id){
        let div = document.createElement('div');
        div.id = id;
        div.style.display = 'none';
        document.body.appendChild(div);
        return new Gridify(id);
    }

    it('Adds a filter textbox on filterable columns', function(){
        let grid = newgrid('filter_test_1');
        grid.initialize({
            columns : [{field : 'Col', filter : true }],
            data : [{ Col : 'a' }]
        });
        assert.isTrue(grid.table.tHead.rows[1].cells[0].firstChild != undefined);
    });
    it('Defaults to xyz% filtering function', function(){
        let grid = newgrid('filter_test_2');
        grid.initialize({
            columns : [{field : 'Col', filter : true }],
            data : [ { Col : 'aab' }, { Col : 'abc' }, { Col : 'bca'}]
        });
        let filter_textbox = grid.table.tHead.rows[1].cells[0].firstChild;
        filter_textbox.value = 'a';
        grid.filtering.filter();
        assert.isTrue(grid.body.rows().filter(r => r.style.display == 'none').length == 1);
        filter_textbox.value = 'aa';
        grid.filtering.filter();
        assert.isTrue(grid.body.rows().filter(r => r.style.display == 'none').length == 2);
    });
    it('Applies all filters to the data set', function(){
        let grid = newgrid('filter_test_3');
        grid.initialize({
            columns : [{field : 'ColA', filter : true }, { field : 'ColB', filter : true}],
            data : [ 
                { ColA : 'a', ColB : 'a' }, 
                { ColA : 'a', ColB : 'b' }, 
                { ColA : 'b', ColB : 'a' },
                { ColA : 'b', ColB : 'b' } ]
        });
        grid.table.tHead.rows[1].cells[0].firstChild.value = 'a';
        grid.table.tHead.rows[1].cells[1].firstChild.value = 'b';
        grid.filtering.filter();
        assert.isTrue(grid.body.rows().filter(r => r.style.display == 'none').length == 3);
    });
    it('Allows for custom filter logic', function(){
        let grid = newgrid('filter_test_4');
        grid.initialize({
            columns : [{field : 'Col', filter : {
                /* %value% search instead of value% search */
                rule : (cell_value, filter_value) =>{
                    return cell_value.includes(filter_value);
                }
            } }],
            data : [{ Col : 'abcd' }, { Col : 'dcba' }]
        });
        grid.table.tHead.rows[1].cells[0].firstChild.value = 'bc';
        grid.filtering.filter();
        assert.isTrue(grid.body.rows().filter(r => r.style.display == 'none').length == 1);
    });
    it('Allows for custom filter control', function(){
        let grid = newgrid('filter_test_5');
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
        grid.initialize({
            columns : [{field : 'Col', filter : {
                control : ddl,
                rule : function(cell_value, filter_value){
                    if(+filter_value === 0) return true;
                    return +filter_value === +cell_value;
                },
                event : 'change'
            } }],
            data : [{ Col : 1 }, { Col : 2 }, { Col : 3 }]
        });
        grid.table.tHead.rows[1].cells[0].firstChild.value = 1;
        grid.filtering.filter();
        assert.isTrue(grid.body.rows().filter(r => r.style.display == 'none').length == 2);
    });
});


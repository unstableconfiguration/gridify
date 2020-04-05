describe('Paging', function(){
    let assert = chai.assert;
    
    let newgrid = function(id){
        let div = document.createElement('div');
        div.id = id;
        div.style.display = 'none';
        document.body.appendChild(div);
        return new Gridify(id);
    }

    it('Limits visible results when paging is true', function(){
        let grid = newgrid('paging_test_1');
        grid.initialize({
            columns : [ { field : 'Col' } ],
            data : [ { Col : '1' }, { Col : '2' }, { Col : '3' } ],
            paging : { rows : 2 }
        });
        let rows = grid.body.rows;
        rows = rows.filter(r => r.style.display === '');
        assert.isTrue(rows.length === 2);
    });
    it('Allows displayed total pages/rows to be overriden');
    it('Can have the page be set programmatically', function(){
        let grid = newgrid('paging_test_3');
        grid.initialize({
            columns : [ { field : 'Col' } ],
            data : [ { Col : '1' }, { Col : '2' }, { Col : '3' } ],
            paging : { rows : 2, currentPage : 1 }
        });
        grid.paging.page(2);
        let rows = grid.body.rows;
        rows = rows.filter(r => r.style.display === '');
        assert.isTrue(rows.length === 1);
    
    });
    it('Can be set after initialization')
});
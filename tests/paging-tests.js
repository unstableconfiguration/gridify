describe('Paging', function(){
    let assert = chai.assert;
    
    it('Limits visible results when paging is true', function() {
        let grid = new Gridify({
            headers : [ { text : 'Col' }],
            columns : [ { field : 'Col' } ],
            data : [ { Col : '1' }, { Col : '2' }, { Col : '3' }, { Col : 4 }, { Col : 5 } ],
            paging : { rows : 2 }
        });
        
        let rows = Array.from(grid.html.tBodies[0].rows);
        rows = rows.filter(r => r.style.display === '');
        assert.isTrue(rows.length === 2);
    });
    it('Allows displayed total pages/rows to be overriden');
    it('Can have the page be set programmatically', function() {
        let grid = new Gridify({
            headers : [ { text : 'col' }],
            columns : [ { field : 'Col' } ],
            data : [ { Col : '1' }, { Col : '2' }, { Col : '3' } ],
            paging : { rows : 2, currentPage : 1 }
        });

        grid.paging.page(2);
        let rows = Array.from(grid.html.tBodies[0].rows);
        rows = rows.filter(r => r.style.display === '');
        assert.isTrue(rows.length === 1);
    
    });
    it('Can be set after initialization')
});
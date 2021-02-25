import { Gridify } from '../src/gridify.js';


export const GridifyTests = function() {
    describe('Table Creation', function() {
        let assert = chai.assert;

        describe('Initialization', function() {
            it('Should create a <table> element accessible through the .html property', function() {
                let grid = new Gridify();
                assert.exists(grid.html);
            });
            it('Should attach the html table to a container if one is provided');
        });

        describe('Caption', function() {
            it('Should create an empty <caption> if .caption is present', function() {
                let grid = new Gridify({ caption : { text : '' }});
                assert.exists(grid.html.caption)
            });
            it('Should not create a <caption> element if .caption is undefined', function() {
                let grid = new Gridify();
                assert(!grid.html.caption);
            });
            it('Should set caption text if .caption is a string', function() { 
                let grid = new Gridify({ caption : 'test caption 1' });
                assert(grid.html.caption.innerText === 'test caption 1');
            });
            it('Should set caption text if .caption.text is set', function() {
                let grid = new Gridify({ caption : { text : 'test caption 2' }});
                assert(grid.html.caption.innerText === 'test caption 2');
            });
            it('Should set attributes if .caption.attributes is set', function() { 
                let grid = new Gridify({
                    caption : {
                        text : 'test',
                        attributes : { title : 'test caption' }
                    }
                });
                assert(grid.html.caption.title === 'test caption');
            });
            it('Should call onCaptionCreated after the caption has been created', function(done) {
                let grid = new Gridify({
                    caption : 'cap',
                    onCaptionCreated : function(caption, captionOptions) { 
                        assert(caption.innerText === 'cap');
                        done();
                    }
                });
            });
        });

        describe('Headers', function() {
            it('Should create an textless th if the column does not have a .header', function() { 
                let grid = new Gridify({
                    columns : [ { field : 'a' } ],
                    data : [ { a : 1 } ]
                });
                assert(grid.html.tHead.rows[0].cells[0].innerText === '');
            });
            it('Should create a th element with text if the column .header is a string', function() {
                let grid = new Gridify({
                    columns : [ { field : 'a' }, { field : 'b', header : 'B' } ],
                    data : [ { a : 1, b : 2 } ] 
                });
                assert(grid.html.tHead.rows[0].cells[1].innerHTML === 'B');
            });
            it('Should create a th with text if the column has a .header object with a .text property', function() {
                let grid = new Gridify({
                    columns : [ { field : 'a' }, { field : 'b', header : 'B' }, { field : 'c', header : { text : 'C' } } ],
                    data : [ { a : 1, b : 2, c : 3 } ] 
                });
                assert(grid.html.tHead.rows[0].cells[2].innerHTML === 'C');
            });
            it('Should set attributes on th if header definition contains .attributes', function() {
                let grid = new Gridify({ 
                    columns : [ { header : { text : 'A', attributes : { title : 'test three' } } } ] 
                });
                assert(grid.html.tHead.rows[0].cells[0].title === 'test three');
            });
            it('Should call onHeaderCellCreated after each header cell has been added', function(done) {
                let grid = new Gridify({
                    columns : [ { header : 'test' } ]
                    , onHeaderCellCreated : function(th, definition) { 
                        assert(th.innerText === 'test');
                        done();
                    }
                });
            });
            it('Should call onHeaderCreated after the header has been created', function(done) {
                let grid = new Gridify({
                    columns : [ { header : 'test 1' }, { header : { text : 'test 2' } } ],
                    onHeaderCreated : function(tHead, headers) { 
                        assert(tHead.rows[0].cells.length === 2);
                        done();
                    }
                });
            });
        });

        describe('Body', function() { 
            it('Should create an empty <tbody> on initializiation', function() {
                let grid = new Gridify({});
                assert.exists(grid.html.tBodies[0]);
            });
            it('Should populate the tBody with rows based on the .data property', function() {
                let grid = new Gridify({
                    data : [
                        { fieldA : 1, fieldB : 'b' }, 
                        { fieldA : 2, fieldB : 'b2' }
                    ]
                });
                assert(grid.html.tBodies[0].rows[0].cells[0].innerText == '1');
            });
            it('Should populate based on column definitions is .columns is provided', function() {
                let grid = new Gridify({
                    data : [ { fieldA : 1, fieldB : 'b' } ],
                    columns : [ { field : 'fieldB' } ]
                });
                assert(grid.html.tBodies[0].rows[0].cells[0].innerText === 'b')
            });
            it('Should set attributes on cells if .columns[x].attributes is set', function() {
                let grid = new Gridify({
                    data : [ { fieldA : 1 } ],
                    columns : [ { field : 'fieldA', attributes : { title : 'one' } } ]
                });
                assert(grid.html.tBodies[0].rows[0].cells[0].title === 'one')
            });
            it('Should call onTableBodyCreated after the body has been created', function(done) {
                let grid = new Gridify({
                    onTableBodyCreated : function(tBody, columns) {
                        assert(tBody.id === 'new-grid-tbody');
                        done();
                    }
                });
            });
            it('Should call onTableRowCreated after a table row has been added', function(done) {
                let grid = new Gridify({
                    data : [ { fieldA : 'test 1' } ],
                    onTableRowCreated : function(tr, colDef) { 
                        assert(tr.cells[0].innerText === 'test 1');
                        done();
                    }
                });
            });
            it('Should call onTableCellCreated after a table cell has been added', function(done) {
                let grid = new Gridify({
                    data : [ { fieldA : 'test 2' } ],
                    onTableCellCreated : function(td, colDef) {
                        assert(td.innerText === 'test 2');
                        done();
                    }
                });
            });
            it('Should execute a click event if .click is set on the column definition', function(done) { 
                let grid = new Gridify({
                    columns : [
                        { field : 'a', header : 'A', click : () => { done(); }}
                    ],
                    data : [ { a : 1 } ]
                });
                grid.html.tBodies[0].rows[0].cells[0].click();
            });
        });

        describe('Data', function() {
            it('Should return a data object array when .get() is called', function() {
                let grid = new Gridify({
                    data : [
                        { fieldA : 1, fieldB : 'b' },
                        { fieldA : 2, fieldB : 'b2' }
                    ]
                });
                let data = grid.data.get();
                assert(data[1].fieldA == 2);
            });
            it('Should call .body.create(data) and redraw the grid when .set(data) is called', function() {
                let grid = new Gridify({
                    data : [{ fieldA : 3 }]
                });
                grid.data.set([
                    { fieldA : 4 }
                ]);
                let data = grid.data.get();
                assert(data[0].fieldA == 4);
                
            });
            it('Should return a datarow when getRowData(tr) is called', function() {
                let grid = new Gridify({
                    data : [
                        { fieldA : 1 }, { fieldA : 2 }, { fieldA : 3 }
                    ]
                });
                let dr = grid.data.getRowData(grid.html.tBodies[0].rows[2]);
                assert(dr.fieldA == 3);
            });
        });

        describe('Footers', function() { 
            it('should contain some footer tests');
        });
    });
}

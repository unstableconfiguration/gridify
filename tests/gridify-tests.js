
describe('Table Creation', function() {
    let assert = chai.assert;

    let div = function(id) {
        let div = document.createElement('div');
        div.id = id;
        div.style.display = none;
        document.body.appendChild(div);
    }

    describe('Initialization', function() {
        it('Should create a <table> element accessible through the .html property', function() {
            let grid = new Gridify();
            assert.exists(grid.html);
        });

        it('Should create an empty <tfoot> if .footers is present', function() {
            let grid = new Gridify({ footers : [{}, {}] });
            assert.exists(grid.html.tFoot);
        });
        it('Should execute onInitialized events for each initialized element', function() {
            let grid = new Gridify();
            grid.table.onInitialized = (e) => assert(e.id === 'new-grid');
            grid.caption.onInitialized = (e) => assert(e.id === 'new-grid-caption');
            grid.header.onInitialized = (e) => assert(e.id === 'new-grid-thead');
            grid.body.onInitialized = (e) => assert(e.id === 'new-grid-tbody');
            grid.footer.onInitialized = (e) => assert(e.id === 'new-grid-tfoot');
            grid.initialize({
                caption : { text : ''},
                headers : [ { } ],
                columns : [ { } ],
                footers : [ { } ]
            });
        });
    });

    describe('Creation', function() {
        it('Should execute onCreated events for each created element', function() {
            let grid = new Gridify({
                caption : { text : ''},
                headers : [ { } ],
                columns : [ { } ],
                footers : [ { } ]
            });
            grid.table.onCreated = (e) => assert(e.id === 'new-grid');
            grid.caption.onCreated = (e) => assert(e.id === 'new-grid-caption');
            grid.header.onCreated = (e) => assert(e.id === 'new-grid-thead');
            grid.body.onCreated = (e) => assert(e.id === 'new-grid-tbody');
            grid.footer.onCreated = (e) => assert(e.id === 'new-grid-tfoot');
            grid.create();
        });
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
            assert(grid.html.caption.innerHTML === 'test caption 1');
        });
        it('Should set caption text if .caption.text is set', function() {
            let grid = new Gridify({ caption : { text : 'test caption 2' }});
            assert(grid.html.caption.innerHTML === 'test caption 2');
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
        it('Should call onInitialized after the caption has been initialized');
        it('Should call onCreated after the caption has been created');
    });

    describe('Header', function() {
        it('Should create an empty <thead> if .headers array is provided', function() {
            let grid = new Gridify({ headers : [{}, {}]});
            assert.exists(grid.html.tHead);
        });
        it('Should not create a <thead> if no .headers array is provided', function() {
            let grid = new Gridify();
            assert(!grid.html.tHead)
        });
        it('Should create a th with text if .headers array contains a string', function() {
            let grid = new Gridify({  headers : ['test 1'] });
            assert(grid.html.tHead.rows[0].cells[0].innerHTML === 'test 1');
        });
        it('Should create a th with text if .headers array contains an object', function() {
            let grid = new Gridify({ headers : ['test 1', { text : 'test 2' }] });
            assert(grid.html.tHead.rows[0].cells[1].innerHTML === 'test 2');
        });
        it('Should set attributes on th if header definition contains .attributes', function() {
            let grid = new Gridify({ 
                headers : [
                    { text : 'test 3', attributes : { title : 'test three' } }
                ] 
            });
            assert(grid.html.tHead.rows[0].cells[0].title === 'test three');
        });
        it('Should call onInitialized after the header has been initialized');
        it('Should call onHeaderCellAdded after each header cell has been added');
        it('Should call onCreated after the header has been created');
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

        it('Should call onInitialized after the body has been initialized', function() {
            let grid = new Gridify({});
            grid.body.onInitialized = (b) => assert(b.id === 'new-grid-tbody');
            grid.initialize({});
        });
        it('Should call onCreated after the body has been created', function() {
            let grid = new Gridify({});
            grid.body.onCreated = (b) => assert(b.id === 'new-grid-tbody');
            grid.create({});
        });
        it('Should call onTableRowAdded after a table row has been added', function() {
            let grid = new Gridify({});
            grid.body.onTableRowAdded = (tr) => assert(tr.cells[0].innerText === 'test 1');
            grid.body.create([{ fieldA : 'test 1'}]);
        });
        it('Should call onTableCellAdded after a table cell has been added', function() {
            let grid = new Gridify({});
            grid.body.onTableCellAdded = (td) => assert(td.innerText === 'test 2');
            grid.body.create([{ fieldA : 'test 2'}]);
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
                {fieldA : 4 }
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

});


/*describe('Gridify Tests', function(){
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
            assert(grid.header.cells[0].firstChild.innerHTML == 'Col')
        });
        it('Allows header text to be set with "header" property', function(){
            let grid = newgrid('column_definitions_test_2');
            grid.initialize({
                data : [ { Col : 'a' } ]
                , columns : [{ field : 'Col', header:'test' }]
            });
            assert(grid.header.cells[0].firstChild.innerHTML == 'test')
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
            assert(grid.table.style.border === 'thin solid blue');
        });

        it('Should set the class property of the html table when .class supplied in the grid definition', function() {
            let grid = newgrid('css_table_class_test');
            grid.initialize({
                columns : [ { field : 'col' } ],
                data : [ { col : 'a' } ],
                class : 'testClass'
            });
            assert(grid.table.className.includes('testClass'));    
        });

        it('Should set the style property of the column cells when .style is supplied in the column definition', function() {
            let grid = newgrid('css_cell_style_test');
            grid.initialize({
                columns : [ { field : 'col', style : 'background: blue' } ],
                data : [ { col : 'a' } ],
            });
            let cell = grid.body.rows[0].cells[0];
            assert(cell.style.backgroundColor === 'blue');
        });

        it('Should set the class property of the column cells when .class is supplied in the column definition', function() {
            let grid = newgrid('css_cell_style_test');
            grid.initialize({
                columns : [ { field : 'col', class : 'bgBlue' } ],
                data : [ { col : 'a' } ],
            });
            let cell = grid.body.rows[0].cells[0];
            assert(cell.className.includes('bgBlue'));
        });

        it('Should set the style property of the header cell when .header.style is supplied in the column definition', function() {
            let grid = newgrid('css_cell_style_test');
            grid.initialize({
                columns : [ { field : 'col', header : { style : 'background: blue' } } ],
                data : [ { col : 'a' } ],
            });
            let cell = grid.header.cells[0];
            assert(cell.style.backgroundColor === 'blue');
        });

        it('Should set the class property of the header cell when .header.class is supplied in the column definition', function() {
            let grid = newgrid('css_cell_style_test');
            grid.initialize({
                columns : [ { field : 'col', header : { class : 'bgBlue' } } ],
                data : [ { col : 'a' } ],
            });
            let cell = grid.header.cells[0];
            assert(cell.className.includes('bgBlue'));
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
            assert(grid.body.rows.length == 0);
            grid.data.set([{ Col : 'a' }]);
            assert(grid.body.rows.length == 1);
        });// 3.1
        it('Allows the table data to be reset outside of initialization', function(){
            let grid = newgrid('data_access_test_3');//3.2
            grid.initialize({
                columns : [{field : 'Col'}],
                data : [{ Col : 'a' }]
            });
            assert(grid.body.rows.length == 1);

            grid.data.set([{ Col : 'b' }, { Col : 'c' }]);
            assert(grid.body.rows.length == 2);
        });
        it('Can retrieve a cell value from the table', function(){
            let grid = newgrid('data_access_test_4');
            grid.initialize({
                columns : [ { field : 'ColA' }, { field : 'ColB' } ],
                data : [ { ColA : 'a', ColB : 'b' }, { ColA : 1, ColB : 2 } ]
            });
            assert(grid.data.getCellValue(1,'ColB') == 2)
        });
        it('Can retrieve a data row from the table', function(){
            let grid = newgrid('data_access_test_5');
            grid.initialize({
                columns : [ { field : 'ColA'}, { field : 'ColB'} ],
                data : [{ ColA : 'a', ColB : 'b'}, { ColA : 'aa', ColB : 'bb'} ]
            });
            let second_row = grid.body.rows[1];
            let second_row_data = grid.data.getRowValues(second_row);
            assert(second_row_data.ColB === 'bb')
        });
        it('Can retrieve a data set from the table', function(){
            let grid = newgrid('data_access_test_6');
            let data = [ { Col : 'a'}, { Col : 'b'}, { Col : 'c'} ];
            grid.initialize({
                columns : [ { field : 'Col'} ],
                data : data
            });
            let grid_data = grid.data.get();
            assert(grid_data !== data); // not a reference to the same object 
            assert(JSON.stringify(grid_data) === JSON.stringify(data)); // same values
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
            assert(grid.body.rows[0].innerText === 'a');
            grid.paging.page(2);
            let get_visible_value = function(){
                return grid.body.rows.find(r => r.style.display === '').innerText;
            }
            assert(get_visible_value() === 'c');
            grid.sorting.sort('Col'); grid.sorting.sort('Col');
            assert(get_visible_value() === 'a');       
        });
        it('Repages after a filter has been applied', function(){
            let grid = newgrid('integration_test_2');
            grid.initialize({
                columns : [ { field : 'Col', filter : true }  ],
                data : [ { Col : 'a' }, { Col : 'a' }, { Col : 'c' }],
                paging : { rows : 2 }
            });
            grid.paging.page(2);
            assert(grid.body.rows.filter(r => r.style.display === '').length === 1);
            let filter_textbox = grid.table.tHead.rows[1].cells[0].firstChild;
            filter_textbox.value = 'a';
            grid.filtering.filter();
            assert(grid.table.options.paging.currentPage === 1);
            assert(grid.body.rows.filter(r => r.style.display === '').length === 2);

        });
    })

});*/

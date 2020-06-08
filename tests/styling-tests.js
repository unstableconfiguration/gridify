
describe('Styling', function() {
    let assert = chai.assert;

    describe('Defaults', function() { 
        it('Should apply default stylings to the <table> element', function() { 
            let grid = new Gridify();
            assert(grid.html.style.borderCollapse === 'collapse');
        });
        it('Should apply default stylings to the <th> elements', function() {
            let grid = new Gridify({
                columns : [ { header : 'test header' } ]
            });
            assert(grid.html.tHead.rows[0].cells[0].style.textAlign === 'center');
        });
        it('Should apply default stylings to the body <td> elements', function() { 
            let grid = new Gridify({
                data : [
                    { fieldA : 1 }
                ]
            });
            assert(grid.html.tBodies[0].rows[0].cells[0].style.textAlign === 'left');
        });
        it('Should apply default stylings to the footer <td> elements', function() { 
            let grid = new Gridify({
                columns : [ { footer : 'test footer' } ]
            });
            assert(grid.html.tFoot.rows[0].cells[0].style.textAlign === 'center');
        });
    });

    describe('Classes', function() { 
        it('Should set the class of the table if .className is set in the grid options', function() { 
            let grid = new Gridify({
                className : 'grid-class'
            });
            assert(grid.html.className === 'grid-class');
        });
        it('Should set the class of the header cells if .className is set in the header options', function() { 
            let grid = new Gridify({
                columns : [ { header : { text : 'test header', className : 'header-class' } } ]
            });
            assert(grid.html.tHead.rows[0].cells[0].className === 'header-class');
        });
        it('Should set the class of the body cells if .className is set in the column options', function() { 
            let grid = new Gridify({
                columns : [ { field : 'fieldA', className : 'body-class' } ],
                data : [ { fieldA : 'test field' } ]
            });
            assert(grid.html.tBodies[0].rows[0].cells[0].className === 'body-class'); 
        });
        it('Should set the class of the footer cells if .className is set in the footer options', function() { 
            let grid = new Gridify({
                columns : [ { footer : { text : 'test footer', className : 'footer-class' } } ]
            });
            assert(grid.html.tFoot.rows[0].cells[0].className === 'footer-class');
        });
    });

    describe('Styles', function() { 
        it('Should set the css style of the table if .style is set in the grid options', function() { 
            let grid = new Gridify({
                style : 'border: thin'
            });
            assert(grid.html.style.borderWidth === 'thin')
        });
        it('Should set the css style of the header cells if .style is set in the header options', function() {
            let grid = new Gridify({
                columns : [ { header : { text : 'test header', style : 'font-weight:bold' } } ]
            });
            assert(grid.html.tHead.rows[0].cells[0].style.fontWeight === 'bold');
        });
        it('Should set the css style of the body cells if .style is set in the column options', function() { 
            let grid = new Gridify({
                columns : [ { field : 'fieldA', style : 'text-decoration:underline' } ],
                data : [ { fieldA : 'test field' } ]
            });
            assert(grid.html.tBodies[0].rows[0].cells[0].style.textDecoration === 'underline');
        });
        it('Should set the css style of the footer cells if .className is set in the foote options', function() { 
            let grid = new Gridify({
                columns : [ { footer : { text : 'test footer', style : 'font-weight:bold' } } ]
            });
            assert(grid.html.tFoot.rows[0].cells[0].style.fontWeight === 'bold');
        });
        it('Should apply the column style to the header before applying the header style', function() { 
            let grid = new Gridify({
                columns : [ 
                    {
                        header: { text : 'Test', style : 'padding:4px;' }, 
                        field : 'test',
                        style : 'width:100px; padding:2px;'
                    }
                ],
                data : [ { test : 1 }, { test : 2 } ]
            });
            assert(grid.html.tHead.rows[0].cells[0].style.width == '100px');
            assert(grid.html.tHead.rows[0].cells[0].style.padding == '4px');
        });
    });


});

let Gridify = function(options = {}) { 
    let grid = this;
    grid.container = options.container;

    grid.initialize = function(options) {
        if(grid.container) { _clear(grid.container); }

        grid.table.initialize(options);
        grid.caption.initialize(options.caption);
        grid.header.initialize(options.headers);
        grid.body.initialize(options.columns);
        grid.footer.initialize(options.footers);
    }

    grid.create = function() {
        if(grid.container) { _clear(grid.container); }

        grid.table.create();
        grid.caption.create();
        grid.header.create();
        grid.body.create();
        grid.footer.create();
    }

    let _clear = function(container) {
        while(container && container.firstChild) { 
            container.removeChild(container.firstChild); 
        }
    }

    let _setAttributes = function(el, attributes) {
        for(let k in attributes) {
            el.setAttribute(k, attributes[k]);
        }
    }

    let _table;
    grid.table = { 
        initialize : function(options) {
            _table = document.createElement('table');
            if(options.id) { _table.id = options.id; }
            else if(grid.container) { _table.id = grid.container.id + '-grid'; }
            else { _table.id = 'new-grid'; }
            grid.table.onInitialized(_table);
        }
        , onInitialized : function(table) { }
        , create : function() {
            grid.table.onCreated(_table);
        }
        , onCreated : function(table) { }
    }
    Object.defineProperty(grid, 'html', { get : () => _table });

    grid.caption = {
        initialize : function(options) {
            if(!options) { return; }

            let caption = _table.createCaption();
            caption.id = _table.id + '-caption';
            caption.options = typeof(options) === 'string' 
                ? { text : options } 
                : options;
            grid.caption.onInitialized(caption);
        }
        , onInitialized : function(caption) {}
        , create : function() {
            if(!_table.caption) { return ; }

            grid.caption._setText();
            _setAttributes(grid.html.caption, grid.html.caption.options.attributes);
            grid.caption.onCreated(_table.caption);
        }
        , onCreated : function(caption) { }
        , _setText : function() {
            let caption = grid.html.caption;
            caption.innerHTML = caption.options.text; 
        } 
    }

    grid.header = {
        initialize : function(options) {
            if(!options) { return; }

            let tHead = _table.createTHead();
            tHead.id = _table.id + '-thead';
            tHead.options = options;
            tHead.insertRow();
            grid.header.onInitialized(tHead);
        }
        , onInitialized(header) {}
        , create : function() {
            if(!_table.tHead) { return; }

            grid.header.addHeaderCells();
            grid.header.onCreated(_table.tHead);
        }
        , onCreated : function(header) { }
        , addHeaderCells : function() {
            let options = _table.tHead.options;
            options.forEach(o => { grid.header.addHeaderCell(o); });
        }
        , addHeaderCell : function(columnDefinition) {
            let th = document.createElement('th');
            th.id = _table.tHead.id + '-' + 'mmm';

            grid.header._setHeaderText(th, columnDefinition);
            _setAttributes(th, columnDefinition.attributes);

            _table.tHead.rows[0].appendChild(th);
            grid.header.onHeaderCellAdded(th); 
        }
        , _setHeaderText : function(th, columnDefinition) {
            th.innerHTML = typeof(columnDefinition) === 'string'
                ? columnDefinition
                : columnDefinition.text;
        }
        , onHeaderCellAdded : function(th) { }
    }

    grid.body = {
        initialize : function(options) {
            while(_table.tBodies.length) { _table.removeChild(_table.tBodies[0]); }
            let tBody = _table.createTBody();
            tBody.id = _table.id + '-tbody';
            tBody.options = options;
            grid.body.onInitialized(tBody);
        }
        , onInitialized(body) {}
        , create : function(data = options.data) {
            _clear(_table.tBodies[0]);

            for(let k in data) {
                grid.body.addTableRow(k, data[k]);
            }

            grid.body.onCreated(_table.tBodies[0]);
        }
        , onCreated : function(body) { }
        , clear : function() { _clear(_table.tBodies[0]); }
        , addTableRow : function(ridx, rowData) {
            let tr = _table.tBodies[0].insertRow();
            tr.id = _table.tBodies[0].id + '-' + ridx;

            for(let field in rowData) {
                grid.body.addTableCell(tr, field, rowData[field]);
            }

            grid.body.onTableRowAdded(tr);
        }
        , onTableRowAdded : function(tr) { }
        , addTableCell : function(tr, field, value) {
            let td = tr.insertCell();
            td.id = tr.id + '-' + field;

            td.field = field;
            td.innerText = value;
            
            grid.body.onTableCellAdded(td);
        }
        , onTableCellAdded : function(td) { }
    }

    grid.data = { 
        get : function() {
            return Array.from(_table.tBodies[0].rows)
                .map(r => grid.data.getRowData(r));
        }
        , set : function(data) {
            grid.body.create(data);
        }
        , getRowData : function(tr) {
            let rowData = {};
            Array.from(tr.cells).forEach(td => {
                rowData[td.field] = td.innerText;
            });
            return rowData;
        }
    }

    grid.footer = { 
        initialize : function(options) {
            if(!options) { return; }
            let tFoot = _table.createTFoot();
            tFoot.id = _table.id + '-tfoot';
            tFoot.options = options;
            grid.footer.onInitialized(tFoot)
        }
        , onInitialized(footer) {}
        , create : function() {
            if(!_table.tFoot) { return; }

            grid.footer.onCreated(_table.tFoot);
        }
        , onCreated : function(footer) { }
    }

    for(var k in grid.extensions) {
        grid.extensions[k].apply(grid, arguments);
    }

    grid.initialize(options);
    grid.create();

    return grid;
}
Gridify.prototype.extensions = {};
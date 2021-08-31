import { filters } from './modules/gridify-filters';
import { paging } from './modules/gridify-paging';
import { sorting } from './modules/gridify-sorting';
import { styling } from './modules/gridify-styling';


export const Gridify = function(options = {}) { 
    let grid = this;
    grid.container = options.container;
    if(typeof(grid.container) === 'string') {
        grid.container = document.getElementById(grid.container);
    }

    grid.create = function(options) {
        if(grid.container) { _clear(grid.container); }

        grid.table.create(options);
        grid.caption.create(options.caption);
        grid.header.create(options.columns);
        grid.body.create(options.data, options.columns);
        grid.footer.create(options.columns);
        // Called here so that onTableCreated is passed the completed table.
        grid.onTableCreated(_table, options);

        if(grid.container) {
            grid.container.appendChild(_table); 
        }
    }

    grid.onTableCreated = function(table, options) { if(options.onTableCreated) { options.onTableCreated(table, options); } }
    grid.onCaptionCreated = function(caption, captionDefinition) { if(options.onCaptionCreated) { options.onCaptionCreated(caption, captionDefinition); } }
    grid.onHeaderCreated = function(tHead, headers) { if(options.onHeaderCreated) { options.onHeaderCreated(tHead, headers); } }
    grid.onHeaderCellCreated = function(th, column) { if(options.onHeaderCellCreated) { options.onHeaderCellCreated(th, column); } }
    grid.onTableBodyCreated = function(tBody, columns) { if(options.onTableBodyCreated) { options.onTableBodyCreated(tBody, columns); } }
    grid.onTableRowCreated = function(tr, columns) { if(options.onTableRowCreated) { options.onTableRowCreated(tr, columns); } }
    grid.onTableCellCreated = function(td, column) { if(options.onTableCellCreated) { options.onTableCellCreated(td, column); } }
    grid.onFooterCreated = function(tFoot, footers) { if(options.onFooterCreated) { options.onFooterCreated(tFoot, footers); } }
    grid.onFooterCellCreated = function(td, footerDefinition) { if(options.onFooterCellCreated) { options.onFooterCellCreated(td, footerDefinition); } }

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
        create : function(options) {
            _table = grid.table.initialize(options);
            _setAttributes(_table, options.attributes);
        }
        , initialize : function(options) {
            _table = document.createElement('table');
            _table.id = grid.table._getTableId(options);
            _table.options = grid.table.__options(options);
            return _table;
        }
        , _getTableId : function(options) {
            if(_table.id) { return _table.id; }
            if(options.id) { return options.id; }
            if(grid.container) { return grid.container.id + '-grid'; }
            return 'new-grid';
        }
        , __options : function(options) { 
            if(!options.columns) {
                options.columns = [];
                if(Array.isArray(options.data) && options.data.length > 0){
                    for(let field in options.data[0]) {
                        options.columns.push({
                            field : field
                        });
                    }
                }
            }

            return options;
        }
    }
    Object.defineProperty(grid, 'html', { get : () => _table });

    grid.caption = {
        create : function(captionDef) {
            if(!captionDef) { return; }
            let caption = grid.caption.initialize();

            let options = grid.caption.__options(captionDef);
            _setAttributes(caption, options.attributes);
            caption.innerText = options.text;

            grid.onCaptionCreated(caption, options);
        }
        , initialize : function() {
            let caption = _table.createCaption();
            caption.id = _table.id + '-caption';

            return caption;
        }
        , __options : function(caption) {
            return typeof(caption) === 'string'
                ? { text : caption }
                : caption;
        }
    }

    grid.header = {
        create : function(columns) {
            if(!columns) { return ; }
            let tHead = grid.header.initialize();

            grid.header.addHeaderCells(columns);

            grid.onHeaderCreated(tHead, columns);
        }
        , initialize : function() {
            if(_table.tHead) { _table.removeChild(_table.tHead); }
            let tHead = _table.createTHead();
            tHead.id = _table.id + '-thead';
            
            return tHead;
        }
        , addHeaderCells : function(columns) {
            let hr = _table.tHead.insertRow();
            columns.forEach(col => { grid.header.addHeaderCell(hr, col); });
        }
        , addHeaderCell : function(headerRow, column) {
            let th = document.createElement('th');
            th.id = _table.tHead.id + '-' + column.field || headerRow.cells.length;
            headerRow.appendChild(th);

            let options = grid.header.__options(column);
            if(options) {
                th.innerText = options.text;
                _setAttributes(th, options.attributes);
            }
            
            grid.onHeaderCellCreated(th, column); 
        }
        , __options : function(column) { 
            if(!column.header) { return; }
            if(typeof(column.header) === 'string') { return { text : column.header } }
            return column.header;
        }
    }

    grid.body = {
        initialize : function() {  
            while(_table.tBodies.length) { _table.removeChild(_table.tBodies[0]); }
            let tBody = _table.createTBody();
            tBody.id = _table.id + '-tbody';
            return tBody;
        }
        , clear : function() { _clear(_table.tBodies[0]); }
        , create : function(data, columns) {
            let tBody = grid.body.initialize();
            
            if(data) {
                data.forEach(row => {
                    grid.body.addTableRow(tBody, row);
                });
            }

            grid.onTableBodyCreated(tBody, columns);
        }
        , addTableRow : function(tBody, dataRow) {
            let tr = tBody.insertRow();
            tr.id = tBody.id + '-' + tBody.rows.length;

            _table.options.columns.forEach(col => {
                grid.body.addTableCell(tr, col, dataRow[col.field]);
            });

            grid.onTableRowCreated(tr);
        }
        , addTableCell : function(tr, column, value) {
            let td = tr.insertCell();
            td.id = tr.id + '-' + column.field;

            td.field = column.field;
            td.value = value;
            td.innerText = value;

            _setAttributes(td, column.attributes);
            if(column.click) { td.onclick = column.click; }

            grid.onTableCellCreated(td, column);
        }
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
                rowData[td.field] = td.value;
            });
            return rowData;
        }
    }

    grid.footer = { 
        create : function(columns) {
            if(!columns) { return ; }
            let tFoot = grid.footer.initialize(columns);

            grid.footer.addFooterCells(tFoot, columns);

            grid.onFooterCreated(tFoot, columns);
        }
        , initialize : function() {
            if(_table.tFoot) { _table.removeChild(_table.tFoot); }
            let tFoot = _table.createTFoot();
            
            tFoot.id = _table.id + '-tfoot';
            
            return tFoot;
        }
        , addFooterCells : function(tFoot, columns) {
            let tr = tFoot.insertRow();
            columns.forEach(column => { 
                grid.footer.addFooterCell(tr, column); 
            });
        }
        , addFooterCell : function(tr, column) {
            let td = tr.insertCell();
            td.id = _table.tFoot.id + '-' + column.field || tr.cells.length;

            let footer = grid.footer.__options(column);
            if(footer) {
                td.innerText = footer.text;
                _setAttributes(td, footer.attributes);
            }

            grid.onFooterCellCreated(td, column);
        }
        , __options : function(column) { 
            if(!column.footer) { return; }
            if(typeof(column.footer) === 'string') {
                return { text : column.footer };
            }
            return column.footer;
        }
    }

    for(var k in grid.extensions) {
        grid.extensions[k].apply(grid, arguments);
    }

    grid.create(options);

    return grid;
}

Gridify.prototype.extensions = {
    filters : filters,
    sorting : sorting,
    paging : paging,
    styling : styling
};
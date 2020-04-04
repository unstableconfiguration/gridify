
let Gridify = function(container){   
    if(typeof(container) === 'string') { 
        container = document.getElementById(container);
    }

    if(!container instanceof HTMLDivElement) {    
        throw('Gridify container must be <div>');
    }

    let grid = this;
    grid.container = container;
    Object.defineProperty(grid, 'table', { get : () => grid.container.firstChild });
    Object.defineProperty(grid, 'options', { get : () => grid.table.options });

    let _clear = (container)=> { 
        if(!container) return; 
        while(container.firstChild) container.removeChild(container.firstChild); 
    }        

    /* Initializes grid within provided container. */
    grid.initialize = function(options){
        _clear(grid.container);
        grid.container
            .appendChild(document.createElement('table'))
            .id = grid.container.id +'_table';
        
        grid.styling.stylizeGrid(grid.table, options)
            
        
        grid.header.initialize(options);
        grid.body.initialize();
        grid.footer.initialize();
        
        if(typeof(options.columns) === 'object') grid.header.addColumns(options.columns);
        if(typeof(options.data) === 'object') grid.data.set(options.data);
        
        grid.table.options = options;
        grid.onInitialized(options);
    }
    grid.onInitialized = function(options){}

    grid.data = {
        get : function() {
            return grid.body.rows.map(r => grid.data.getRowValues(r));
        }
        , set : function(data) {
            grid.body.clear();
            data.forEach((rowData, ridx) => {
                grid.body.add_row(rowData, ridx);
            });
        }
        , getRowValues : function(row){
            let rowValues = {};
            Array.from(row.cells).forEach(c => {
                rowValues[c.id.split('_').pop()] = c.innerText;
            });
            return rowValues;
        }
        , getCellValue : function(row, property){
            if(typeof(row) === 'number') { row = grid.body.rows[row]; }
            return Array.from(row.cells)
                .find(x => x.id.split('_').slice(-1) == property)
                .innerText;
        }
    }

    grid.header = {
        initialize : function(options){
            let tHead = grid.table.createTHead();
            tHead.insertRow(); // Label 
            grid.header.onInitialized(options);
        }
        , onInitialized : function(options){}
        //, cells : defined using object.defineProperty below
        , findCell : function(property) { 
            return grid.header.cells.find(c => c.id.split('_').pop() === property); 
        }
        , addColumns : function(columnDefinitions){
            if(!Array.isArray(columnDefinitions)) 
                throw`.columns.set requires an array of column definitions`;

            columnDefinitions.forEach(col => {
                grid.header.addColumn(col);
            });
        }
        , addColumn : function(columnDefinition){
            let headerCell = grid.table.tHead.rows[0].insertCell();
            headerCell.id = grid.table.id + '_header_' + columnDefinition.field;
            grid.header._setHeaderLabel(headerCell, columnDefinition);
            grid.header._setHeaderStyle(headerCell, columnDefinition);
            
            grid.header.onColumnAdded(headerCell, columnDefinition);
            grid.body.seed_row.addColumn(columnDefinition);
        }
        , onColumnAdded : function(headerCell, columnDefinition){ 
            // used by extensions to further modify and add functionality to columns.
        }     
        , _setHeaderLabel : function(headerCell, columnDefinition) {
            let label = headerCell.appendChild(document.createElement('span'));
            label.innerHTML = columnDefinition.header || columnDefinition.field;
        }
        , _setHeaderStyle : function(headerCell, columnDefinition) {
            grid.styling.stylizeHeaderCell(headerCell, columnDefinition);
        }
    }
    Object.defineProperty(grid.header, 'cells', { get : () => Array.from(grid.table.tHead.rows[0].cells) });

    grid.body = {
        initialize : function(table=grid.table) {
            let main_body = table.createTBody();
            grid.body.seed_row.initialize();
        }
        , clear : function(){ _clear(grid.table.tBodies[0]); }
        //, rows : defined as property below
        , _set_body_cell : function(body_cell, value, column_definition) {
            let label = body_cell.appendChild(document.createElement('span'));
            label.innerHTML = value;
        }
        , add_row : function(row_data, rowid) {
            let row = grid.body.seed_row.clone();
            row.id = grid.table.id+'_'+rowid;
            grid.table.tBodies[0].appendChild(row);
            Array.from(row.cells).forEach((cell)=>{
                let field = cell.id.split('_').slice(-1);
                cell.id = row.id + '_' + field;
                cell.innerHTML = row_data[field];
            });
        }
        , seed_row : {
            initialize : function(){
                let seed_body = grid.table.createTBody();
                let seed_row = seed_body.insertRow();
                seed_row.id = grid.table.id + '_seed';
                seed_row.style.display = 'none';
            }
            , clone : function() {
                let seed = grid.table.tBodies[1].rows[0];
                let row = seed.cloneNode(true);
                row.style. display = '';
                Array.from(seed.cells).forEach((scell, cidx)=>{
                    let cell = row.cells[cidx];
                    cell.addEventListener('click', scell.onclick);
                });
                return row;       
            }
            , addColumn(column_definition){
                let tr = grid.table.tBodies[1].rows[0];
                let td = tr.insertCell();
                td.id = tr.id + '_' + column_definition.field;
                td.innerHTML = 'test';
                
                grid.styling.stylizeTableCell(td, column_definition);
                if(column_definition.click)
                    td.onclick = column_definition.click;
            }
        }
    }
    Object.defineProperty(grid.body, 'rows', { get : () => Array.from(grid.table.tBodies[0].rows) });

    grid.footer = {
        initialize : function() {
            grid.table.createTFoot();
        }
    }

    grid.styling = {
        defaults : { 
            grid : `border-collapse:collapse`,
            tbody : {
                tr : `` // border bottom
                , td : `border-bottom:solid thin;padding:.08rem .25rem;overflow:hidden;text-align:left;text-overflow:ellipses;white-space:nowrap`
            }
            , thead : {
                tr : ``
                , td : `font-weight:bold; text-align:center; padding:4px 16px 4px 16px;` 
            }
        }
        , stylize : function(el, style) {
            (style||'').split(';')
                .map(x => x.trim().split(':'))
                .forEach(kv => el.style[kv[0]]=kv[1]);
        }
        , stylizeGrid : function(table, options){
            grid.styling.stylize(table, grid.styling.defaults.grid);
            if(options.class) { table.className = options.class; }
            if(options.style) { grid.styling.stylize(table, options.style); }
        }
        // columns : [ { header : { style : 'xyz' } }]
        , stylizeHeaderCell : function(td, col) {
            grid.styling.stylize(td, grid.styling.defaults.thead.td);
            if(col.header && col.header.class) { td.className = col.header.class; }
            if(col.header && col.header.style) { grid.styling.stylize(td, col.header.style); }
        }
        // columns : [ { style : 'xyz' }]
        , stylizeTableCell: function(td, col) {
            grid.styling.stylize(td, grid.styling.defaults.tbody.td);
            if(col.class) { td.className = col.class; }
            grid.styling.stylize(td, col.style);
        }
    }

    for(var k in grid.extensions)
        grid.extensions[k].apply(grid, arguments);
    
    return grid;
}
Gridify.prototype.extensions = {};

//return Gridify;


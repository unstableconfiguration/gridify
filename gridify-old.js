

/*
    Major rewrite 
    instead of 
        new Gridify(container).initialize(options); 

    we're going to do 
    new Gridify(options); 
        which will return the grid and, if a container is provided, will attach it to the container

    we're going to change up some of our flow and events 
    change .initialize to .create
    create stores the relevant information in its associated element, then creates its stuff 
        every main event will have a onX followup event for extension


    we're going to move styling out of here as an extension 

    main gridify will create an unformatted table of data. 
    
*/




let Gridify = function(options) {   
    let grid = {};

    // initialize: 
        // clear and recreate major grid elements. 
        // table, head, body, footer, caption
        // store data in those elements 
    // onInitialized
    // create:
        // populate major elements 
        // execute oncreated 


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
                grid.body.addRow(rowData, ridx);
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
            return grid.header.cells.find(c => c.id.split('-').pop() === property); 
        }
        , addColumns : function(colDefs){
            if(!Array.isArray(colDefs)) 
                throw`.columns.set requires an array of column definitions`;

            colDefs.forEach(col => {
                grid.header.addColumn(col);
            });
        }
        , addColumn : function(colDef) {
            let th = document.createElement('th');
            th.id = grid.table.id + '-header-' + colDef.field;
            grid.table.tHead.rows[0].appendChild(th);

            grid.header._setHeaderLabel(th, colDef);
            grid.header._setHeaderStyle(th, colDef);
            
            grid.header.onColumnAdded(th, colDef);
            grid.body.seedRow.addColumn(colDef);
        }
        , onColumnAdded : function(headerCell, colDef){ 
            // used by extensions to further modify and add functionality to columns.
        }     
        , _setHeaderLabel : function(headerCell, colDef) {
            let label = headerCell.appendChild(document.createElement('span'));
            label.innerHTML = colDef.header || colDef.field;
        }
        , _setHeaderStyle : function(headerCell, colDef) {
            grid.styling.stylizeHeaderCell(headerCell, colDef);
        }
    }
    Object.defineProperty(grid.header, 'cells', { get : () => Array.from(grid.table.tHead.rows[0].cells) });

    grid.body = {
        initialize : function(table = grid.table) {
            let main_body = table.createTBody();
            grid.body.seedRow.initialize();
        }
        , clear : function(){ _clear(grid.table.tBodies[0]); }
        //, rows : defined as property below
        , _setBodyCell : function(bodyCell, value, colDef) {
            let label = bodyCell.appendChild(document.createElement('span'));
            label.innerHTML = value;
        }
        , addRow : function(rowData, rowid) {
            let row = grid.body.seedRow.clone();
            row.id = grid.table.id + '_' + rowid;
            grid.table.tBodies[0].appendChild(row);
            Array.from(row.cells).forEach((cell)=>{
                let field = cell.id.split('_').slice(-1);
                cell.id = row.id + '_' + field;
                cell.innerHTML = rowData[field];
            });
        }
        , seedRow : {
            initialize : function(){
                let seed_body = grid.table.createTBody();
                let seedRow = seed_body.insertRow();
                seedRow.id = grid.table.id + '_seed';
                seedRow.style.display = 'none';
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
            , addColumn(colDef){
                let tr = grid.table.tBodies[1].rows[0];
                let td = tr.insertCell();
                td.id = tr.id + '_' + colDef.field;
                td.innerHTML = 'test';
                
                grid.styling.stylizeTableCell(td, colDef);
                if(colDef.click)
                    td.onclick = colDef.click;
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


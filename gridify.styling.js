
Gridify.prototype.extensions.styling = function(div) {
    let grid = this;

    // onTableCreated 
        // onHeaderCreated
            // onHeaderCellCreated 
        // onCaptionCreated
        // onBodyCreated 
            // onTableRowCreated
            // onTableCellCreated 
        // onFooterCreated
            // onFooterCellCreated

    // for each one, we'll need the options for it. 
        // onTableCellCreated needs the coldef 
        // onHeaderCellCreated neeeds the coldef. 

    // that also exposes that our syntax won't really support styling for 
    // a lot of this. 
    // we can style the table for example, but not the tbody 
        // if we do the body with, say, a .body {} object, we won't have 
        // styling for our rows 

    // so really, the table at large, and cells. 
        // if you want more depth than that, override the creation methods. 
        // speaking of which, we should do that.... 

    grid.styling = {
        defaults : { 
            grid : `border-collapse:collapse`,
            tbody : {
                tr : `` 
                , td : `
                    border-bottom:solid thin;
                    padding:.08rem .25rem;
                    overflow:hidden;
                    text-align:left;
                    text-overflow:ellipses;
                    white-space:nowrap`
            }
            , thead : {
                tr : ``
                , td : `
                    font-weight:bold; 
                    text-align:center; 
                    padding:4px 16px 4px 16px;` 
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

}
//Gridify.prototype.extensions.styling = function() {
export const styling = function() {
    let grid = this;

    let onTableCreated = grid.onTableCreated;
    grid.onTableCreated = function(table, options) {
        grid.styling.stylize(table, options);
        onTableCreated(table, options);
    }

    let onHeaderCellCreated = grid.onHeaderCellCreated;
    grid.onHeaderCellCreated = function(th, options) {        
        if(options.style) { grid.styling.setStyle(th, options.style); }
        grid.styling.stylize(th, options.header);

        onHeaderCellCreated(th, options);
    }

    let onTableCellCreated = grid.onTableCellCreated;
    grid.onTableCellCreated = function(td, options) { 
        grid.styling.stylize(td, options);
        onTableCellCreated(td, options);
    }

    let onFooterCellCreated = grid.onFooterCellCreated;
    grid.onFooterCellCreated = function(td, options) { 
        grid.styling.stylize(td, options.footer);
        onFooterCellCreated(td, options);
    }

    grid.styling = {
        defaults : { 
            table : `border-collapse:collapse`
            , tHead : {
                tr : ``
                , th : `
                    text-align:center;` 
            }
            , tBody : {
                tr : `` 
                , td : `
                    text-align:left;
                    text-overflow:ellipsis;
                    white-space:nowrap`
            }
            , tFoot : {
                tr : ``
                , td : `
                    text-align:center;`
            }
        }
        , stylize : function(el, options) {
            grid.styling.setDefaultStyle(el);
            if(!options) { return; }
            if(options.className) { el.className = options.className; }
            if(options.style) { grid.styling.setStyle(el, options.style); }
        }
        , setDefaultStyle : function(el) { 
            let defaults = '';
            switch(el.tagName) {
                case 'TABLE' : defaults = grid.styling.defaults.table; break;
                case 'TH' : defaults = grid.styling.defaults.tHead.th; break;
                case 'TD' : 
                    defaults = el.id.includes('tbody') 
                        ? grid.styling.defaults.tBody.td 
                        : grid.styling.defaults.tFoot.td;
                    break;
            }
            grid.styling.setStyle(el, defaults);
        }
        , setStyle : function(el, style) {
            (style||'').split(';')
                .map(x => x.trim().split(':'))
                .forEach(kv => {
                    if(!kv || kv.length !== 2) { return; }
                    let key = kv[0].trim(), value = kv[1].trim();
                    el.style[key] = value;
                });

        }
    }
}
//Gridify.prototype.extensions.styling = function() {
export const styling = function() {
    let grid = this;

    let onTableCreated = grid.onTableCreated;
    grid.onTableCreated = function(table, options) {
        grid.styling.stylize(table, options);
        onTableCreated(table, options);
    }

    let onCaptionCreated = grid.onCaptionCreated;
    grid.onCaptionCreated = function(caption, options) { 
        grid.styling.stylize(caption, options);
        onCaptionCreated(caption, options);
    }

    let onHeaderCellCreated = grid.onHeaderCellCreated;
    grid.onHeaderCellCreated = function(th, options) {
        // Allow columns to set width of header
        let width = (options.style||'').split(';')
            .find(s => s.includes('width'));
        grid.styling.stylize(th, { style : width });  
        
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
        stylize : function(el, options) {
            if(!options) { return; }
            if(options.className) { el.className = options.className; }
            if(options.style) { grid.styling.setStyle(el, options.style); }
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
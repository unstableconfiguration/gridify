
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

    let _clear = function(container) {
        while(container && container.firstChild) { 
            container.removeChild(container.firstChild); 
        }
    }


    grid.table = { 
        initialize : function(options) {
            grid.table = document.createElement('table');
            if(options.id) { grid.table.id = options.id; }
            else if(grid.container) { grid.table.id = grid.container.id + '-grid'; }
            else { grid.table.id = 'new-grid'; }
        }
    }
    Object.defineProperty(grid, 'html', { get : () => grid.table });

    grid.caption = {
        initialize : function(options) {
            if(!options) { return; }
            let caption = grid.table.createCaption();
            caption.id = grid.table.id + '-caption';
            caption.options = options;
            grid.caption.onInitialized(caption);
        }
        , onInitialized : function(caption) {}
    }

    grid.header = {
        initialize : function(options) {
            if(!options) { return; }
            let tHead = grid.table.createTHead();
            tHead.id = grid.table.id + '-thead';
            tHead.options = options;
            grid.table.appendChild(tHead);
            grid.header.onInitialized(tHead);
        }
        , onInitialized(header) {}
    }

    grid.body = {
        initialize : function(options) {
            if(!options) { return; }
            let tBody = grid.table.createTBody();
            tBody.id = grid.table.id + '-tbody';
            tBody.options = options;
            grid.body.onInitialized(tBody);
        }
        , onInitialized(body) {}
    }

    grid.footer = { 
        initialize : function(options) {
            if(!options) { return; }
            let tFoot = grid.table.createTFoot();
            tFoot.id = grid.table.id + '-tfoot';
            tFoot.options = options;
            grid.footer.onInitialized(tFoot)
        }
        , onInitialized(footer) {}
    }

    for(var k in grid.extensions) {
        grid.extensions[k].apply(grid, arguments);
    }

    grid.initialize(options);

    return grid;
}
Gridify.prototype.extensions = {};
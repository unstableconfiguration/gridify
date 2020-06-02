
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

    let _table;
    grid.table = { 
        initialize : function(options) {
            _table = document.createElement('table');
            if(options.id) { _table.id = options.id; }
            else if(grid.container) { _table.id = grid.container.id + '-grid'; }
            else { _table.id = 'new-grid'; }
            grid.table.onInitialized(_table);
        }
        , onInitialized : function(table) {

        }
        , create : function() {
            console.log(1)
            grid.table.onCreated(_table);
        }
        , onCreated : function(table) {

        }
    }
    Object.defineProperty(grid, 'html', { get : () => _table });

    grid.caption = {
        initialize : function(options) {
            if(!options) { return; }
            let caption = _table.createCaption();
            caption.id = _table.id + '-caption';
            caption.options = options;
            grid.caption.onInitialized(caption);
        }
        , onInitialized : function(caption) {}
        , create : function() {
            if(!_table.caption) { return ; }
            grid.caption.setText();
            grid.caption.setAttributes();
            grid.caption.onCreated(_table.caption);
        }
        , onCreated : function(caption) {

        }
        , setText : function() {
            let caption = grid.html.caption;
            if(typeof(caption.options) === 'string') { caption.innerHTML = caption.options; }
            else if(caption.options.text) { caption.innerHTML = caption.options.text; }
        }
        , setAttributes : function() { 
            let caption = grid.html.caption;
            let attributes = caption.options.attributes;
            for(let k in attributes) { 
                caption.setAttribute(k, attributes[k]); 
            }
        }   
    }

    grid.header = {
        initialize : function(options) {
            if(!options) { return; }
            let tHead = _table.createTHead();
            tHead.id = _table.id + '-thead';
            tHead.options = options;
            grid.header.onInitialized(tHead);
        }
        , onInitialized(header) {}
        , create : function() {
            if(!_table.tHead) { return; }

            grid.header.onCreated(_table.tHead);
        }
        , onCreated : function(header) {

        }
    }

    grid.body = {
        initialize : function(options) {
            if(!options) { return; }
            let tBody = _table.createTBody();
            tBody.id = _table.id + '-tbody';
            tBody.options = options;
            grid.body.onInitialized(tBody);
        }
        , onInitialized(body) {}
        , create : function() {
            if(!_table.tBodies[0]) { return; }

            grid.body.onCreated(_table.tBodies[0]);
        }
        , onCreated : function(body) {

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
        , onCreated : function(footer) {

        }
    }

    for(var k in grid.extensions) {
        grid.extensions[k].apply(grid, arguments);
    }

    grid.initialize(options);
    grid.create();

    return grid;
}
Gridify.prototype.extensions = {};
//Gridify.prototype.extensions.filtering = filtering
const filtering = function() { 
    let grid = this;

    let onHeaderCreated = grid.onHeaderCreated;
    grid.onHeaderCreated = function(header, headers) {
        let hasFilters = headers.some(h => h.filter);
        if(hasFilters) { grid.filtering.addFilters(headers); }
        
        onHeaderCreated(header, headers);
    };

    grid.filtering = { 
        initialize : function(headers) {
            let filterRow = grid.html.tHead.insertRow();
            filterRow.id = grid.html.id + '-filters';
            //headers.forEach(h => grid.filtering._addFilterCell(filterRow.cells.length));
        }
        , addFilters : function(headers) { 
            grid.filtering.initialize(headers);
            for(let idx in headers) { 
                let th = grid.filtering._addFilterCell(idx);
                grid.filtering.addFilter(th, idx, headers[idx].filter);
            }
        }
        , addFilter : function(th, idx, options) {
            if(!options) { return; }
            options = grid.filtering._getFilterOptions(options);

            let control = options.control;
            control.idx = idx;
            control.rule = options.rule;
            control.addEventListener(options.event, () => { grid.filtering.filter(); });
            th.appendChild(control);
        }
        , cells : function() { return Array.from(grid.html.tHead.rows[1].cells); }
        , filter : function() {
            let filterControls = grid.filtering.getControls();
            Array.from(grid.html.tBodies[0].rows).forEach((row, i)=>{
                let filteredOut = filterControls.some((filterControl)=>{
                    let cellValue = row.cells[filterControl.idx].value;
                    return !filterControl.rule(cellValue, filterControl.value);
                });
                row.filtered = filteredOut;
                row.style.display = filteredOut ? 'none' : '';
            }); 
            grid.filtering.onFiltered();
        }
        , onFiltered : function() { }
        , getControls : function(){
            return grid.filtering.cells().map(cell => cell.firstChild).filter(x => !!x);
        }
        , _addFilterCell : function(idx) {
            let th = document.createElement('th');
            th.id = grid.html.id + '-filters-' + idx;
            grid.html.tHead.rows[1].appendChild(th);
            return th;
        }
        , _getFilterOptions : function(filter) { 
            let options = {
                rule : grid.filtering._defaultFilterRule,
                control : grid.filtering._getDefaultFilterControl(),
                event : 'keyup'
            };
            if(typeof(filter) === 'function') { options.rule = filter; }
            if(typeof(filter) === 'object') {
                for(let k in filter) { options[k] = filter[k]; }
            }

            return options;
        }
        , _defaultFilterRule : function(cellValue, fieldValue) {
            return (''+cellValue).toLowerCase()
                .substr(0, fieldValue.length) === fieldValue.toLowerCase();
        }
        , _getDefaultFilterControl : function(field){
            let control = document.createElement('input');
            control.type = 'text';
            control.id = grid.table.id + '_fiter_' + field;
            control.style = 'width:80%; display: block; margin: auto;';
            return control;
        }
    };
};

//Gridify.prototype.extensions.paging = function(){
const paging = function() {
    let grid = this;

    let onFooterCreated = grid.onFooterCreated;
    grid.onFooterCreated = function(footer, footers) { 
        grid.paging.initialize(grid.html.options.paging);
        onFooterCreated(footer, footers); 
    };

    grid.footer.pager = {
        initialize : function(options){
            let pagingRow = grid.html.tFoot.insertRow();
            pagingRow.id = grid.html.id + '-paging';
            pagingRow.options = options; 

            let leftCell = pagingRow.insertCell();
            leftCell.id = grid.html.id + '-paging-left';
            leftCell.style = 'width:33%;';

            let centerCell = pagingRow.insertCell();
            centerCell.id = grid.html.id + '-paging-center';
            centerCell.style = 'width:33%;';
            centerCell.appendChild(grid.footer.pager.centerCell_control(options));

            let rightCell = pagingRow.insertCell();
            rightCell.id = grid.html.id + '-paging-right';
            rightCell.style = 'width:33%;';    
        }
        , setPage : function(pageNumber){
            let textbox = document.getElementById(grid.html.id + '-paging-center-textbox');
            if(textbox) { textbox.value = pageNumber; }
            // set row counter when up
        }
        , centerCell_control : function(options){
            let container = document.createElement('div');
            container.style = 'width:120px';

            let textbox = document.createElement('input');
            textbox.id = grid.html.id + '-paging-center-textbox';
            textbox.className = 'pager-textbox';
            textbox.value = options.currentPage || 1;
            textbox.addEventListener('change', () => {
                grid.paging.page(textbox.value < options.totalPages ? +textbox.value : options.totalPages);
            });

            let label = document.createElement('span');
            label.style = 'width:40px;vertical-align:top';
            label.innerText = ' of ' + options.totalPages || 1;

            let leftArrow = document.createElement('div');
            leftArrow.className = 'pager-left';
            leftArrow.onclick = () => 
                grid.paging.page(textbox.value > 1 ? +textbox.value -1 : 1);
            
            let rightArrow = document.createElement('div');
            rightArrow.className = 'pager-right';
            rightArrow.onclick = () => 
                grid.paging.page(textbox.value < options.totalPages ? +textbox.value +1  : options.totalPages); 

            container.appendChild(leftArrow);
            container.appendChild(textbox);
            container.appendChild(label);
            container.appendChild(rightArrow);

            return container;
        }
    };

    grid.paging = { 
        initialize : function(options){
            if(!options) { return; }

            grid.paging.extendSorting();
            grid.paging.extendFiltering();

            options = grid.paging._defaultOptions(options);
            grid.html.options.paging = options;
            grid.footer.pager.initialize(options); 
            grid.paging.page(options.currentPage);
        }
        // Not sure how to make these modules agnostic of one another. 
        // In the meantime, paging needs to know about sorting and filtering.
        , extendSorting : function(){
            if(typeof(grid.sorting) !== 'undefined'){
                let sort = grid.sorting.sort;
                grid.sorting.sort = function(options = {}){
                    grid.paging.clear();
                    sort(options);
                    let currentPage = grid.html.options.paging.currentPage;    
                    grid.paging.page(currentPage);
                };
            }
        }
        , extendFiltering : function() {
            if(typeof(grid.filtering) !== 'undefined'){
                let filter = grid.filtering.filter;
                grid.filtering.filter = function() {  
                    grid.paging.clear();
                    filter(); 
                    grid.paging.page();
                };
            }
        }
        , page : function(pageNumber = 1) {
            grid.html.options.paging.currentPage = pageNumber;
            grid.paging._setFooterValues(pageNumber);
            grid.paging._setRowVisibility(pageNumber);
        }
        , clear : function() { 
            let rows = Array.from(grid.html.tBodies[0].rows);
            rows.forEach(r => { if(r.paged) { r.paged = undefined; r.style.display = ''; } });
        }
        , _setRowVisibility : function(pageNumber){
            let rows = Array.from(grid.html.tBodies[0].rows);
            let options = grid.html.options.paging;
            
            grid.paging.clear();
            
            let start = (options.currentPage - 1) * options.rows;
            let end = options.currentPage * options.rows;

            // Only page visible rows
            rows = rows.filter(r => r.style.display !== 'none');
            rows = rows.filter((r, ix) => ix >= end || ix < start);

            rows.forEach(r => {r.style.display = 'none'; r.paged = true; });
        }
        , _setFooterValues : function(pageNumber){
            grid.footer.pager.setPage(pageNumber);
        }
        , _defaultOptions : function(options){
            if(typeof(options) !== 'object') options = {};
            options.rows = options.rows || 20;
            options.totalRows = options.totalRows || grid.data.get().length;
            options.totalPages = Math.ceil(options.totalRows/options.rows);
            options.currentPage = options.currentPage || 1;
            return options;
        }
    };
};

//Gridify.prototype.extensions.sorting = function(){
const sorting = function() {
    let grid = this;

    let onHeaderCellCreated = grid.onHeaderCellCreated;
    grid.onHeaderCellCreated = function(th, headerDefinition) {
        grid.sorting.initialize(th, headerDefinition);

        onHeaderCellCreated(th, headerDefinition);
    };

    grid.sorting = {
        initialize : function(th, headerDefinition) { 
            if(!headerDefinition.sort) { return; }

            let options = grid.sorting._parseOptions(headerDefinition.sort);
            let idx = Array.from(th.parentElement.children).indexOf(th);
            options.idx = idx;
            th.sort = options;

            grid.sorting._addSortIcon(th);
            
            let sortCallback = grid.sorting._getSortCallback();  
            th.addEventListener('click', sortCallback);    
        }
        , _parseOptions : function(sortOptions) { 
            let options = { compare : grid.sorting.defaultCompare };
            if(typeof(sortOptions) === 'function') { options.compare = sortOptions; }
            else if(typeof(sortOptions) === 'object') {
                for(let k in sortOptions) { options[k] = sortOptions[k]; }
            }

            return options;
        }
        , getSortOptionsByField : function(field) { 
            let idx = grid.html.tBodies[0].options
                .findIndex(colDef => colDef.field == field);

            let th = grid.html.tHead.rows[0].cells[idx];
            return th.sort;
        }
        , sort : function(options) {
            if(typeof(options) === 'string') { 
                options = grid.sorting.getSortOptionsByField(options); 
            }

            options.direction = options.direction === -1 ? 1 : -1;

            let rows = Array.from(grid.html.tBodies[0].rows);            
            rows.sort((x, y) => {
                let xv = x.cells[options.idx].value;
                let yv = y.cells[options.idx].value; 
                let compared = options.compare(xv, yv);
                return +compared * options.direction;
            });
            
            grid.sorting._redrawGrid(rows);
        }
        , _addSortIcon : function(th) { 
            let icon = th.appendChild(document.createElement('span'));
            icon.className = 'sort';
            th.style.paddingRight = '30px';
        }
        , _getSortCallback : function() {
            return (e) => { grid.sorting.sort(e.target.sort); }
        }
        , _redrawGrid : function(rows) {
            grid.body.clear();
            let tBody = grid.html.tBodies[0];
            rows.forEach(r => tBody.appendChild(r));
        }
    };
    Object.defineProperty(grid.sorting, 'defaultCompare', { get : () => function(a, b) { if(a == b) { return 0; } return a < b ? 1 : -1; } });
};

//Gridify.prototype.extensions.styling = function() {
const styling = function() {
    let grid = this;

    let onTableCreated = grid.onTableCreated;
    grid.onTableCreated = function(table, options) {
        grid.styling.stylize(table, options);
        onTableCreated(table, options);
    };

    let onHeaderCellCreated = grid.onHeaderCellCreated;
    grid.onHeaderCellCreated = function(th, options) {        
        if(options.style) { grid.styling.setStyle(th, options.style); }
        grid.styling.stylize(th, options.header);

        onHeaderCellCreated(th, options);
    };

    let onTableCellCreated = grid.onTableCellCreated;
    grid.onTableCellCreated = function(td, options) { 
        grid.styling.stylize(td, options);
        onTableCellCreated(td, options);
    };

    let onFooterCellCreated = grid.onFooterCellCreated;
    grid.onFooterCellCreated = function(td, options) { 
        grid.styling.stylize(td, options.footer);
        onFooterCellCreated(td, options);
    };

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
    };
};

const Gridify = function(options = {}) { 
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

        if(grid.container) {
            grid.container.appendChild(_table); 
        }
    };


    grid.onTableCreated = function(table, options) { if(options.onTableCreated) { options.onTableCreated(table, options); } };
    grid.onCaptionCreated = function(caption, captionDefinition) { if(options.onCaptionCreated) { options.onCaptionCreated(caption, captionDefinition); } };
    grid.onHeaderCreated = function(tHead, headers) { if(options.onHeaderCreated) { options.onHeaderCreated(tHead, headers); } };
    grid.onHeaderCellCreated = function(th, headerDefinition) { if(options.onHeaderCellCreated) { options.onHeaderCellCreated(th, headerDefinition); } };
    grid.onTableBodyCreated = function(tBody, columns) { if(options.onTableBodyCreated) { options.onTableBodyCreated(tBody, columns); } };
    grid.onTableRowCreated = function(tr, columns) { if(options.onTableRowCreated) { options.onTableRowCreated(tr, columns); } };
    grid.onTableCellCreated = function(td, columnDefinition) { if(options.onTableCellCreated) { options.onTableCellCreated(td, columnDefinition); } };
    grid.onFooterCreated = function(tFoot, footers) { if(options.onFooterCreated) { options.onFooterCreated(tFoot, footers); } };
    grid.onFooterCellCreated = function(td, footerDefinition) { if(options.onFooterCellCreated) { options.onFooterCellCreated(td, footerDefinition); } };

    let _clear = function(container) {
        while(container && container.firstChild) { 
            container.removeChild(container.firstChild); 
        }
    };

    let _setAttributes = function(el, attributes) {
        for(let k in attributes) {
            el.setAttribute(k, attributes[k]);
        }
    };

    let _table;
    grid.table = { 
        create : function(options) {
            _table = grid.table.initialize(options);
            _setAttributes(_table, options.attributes);
            grid.onTableCreated(_table, _table.options);
        }
        , initialize : function(options) {
            _table = document.createElement('table');
            _table.id = grid.table._getTableId(options);
            _table.options = options;
            return _table;
        }
        , _getTableId : function(options) {
            if(_table.id) { return _table.id; }
            if(options.id) { return options.id; }
            if(grid.container) { return grid.container.id + '-grid'; }
            return 'new-grid';
        }
    };
    Object.defineProperty(grid, 'html', { get : () => _table });

    grid.caption = {
        create : function(captionOptions) {
            if(!captionOptions) { return; }
            let caption = grid.caption.initialize(captionOptions);

            _setAttributes(caption, caption.options.attributes);
            caption.innerText = caption.options.text;

            grid.onCaptionCreated(caption, caption.options);
        }
        , initialize : function(captionOptions) {
            let caption = _table.createCaption();

            caption.id = _table.id + '-caption';
            caption.options = typeof(captionOptions) === 'string' 
                ? { text : captionOptions } 
                : captionOptions;

            return caption;
        }
    };

    grid.header = {
        create : function(columns) {
            if(!columns) { return ; }
            let tHead = grid.header.initialize(columns);

            grid.header.addHeaderCells();

            grid.onHeaderCreated(tHead, tHead.options);
        }
        , initialize : function(columns) {
            if(_table.tHead) { _table.removeChild(_table.tHead); }
            let tHead = _table.createTHead();

            tHead.id = _table.id + '-thead';
            tHead.options = grid.header._parseOptions(columns);
            
            return tHead;
        }
        , _parseOptions : function(columns) {
            return columns.map(opt => {
                if(typeof(opt.header) === 'string') { 
                    opt.header = { text : opt.header }; 
                }
                return opt;
            });
        }
        , addHeaderCells : function() {
            let hr = _table.tHead.insertRow();
            _table.tHead.options
                .forEach(o => { grid.header.addHeaderCell(hr, o); });
        }
        , addHeaderCell : function(headerRow, columnDefinition) {
            let th = document.createElement('th');
            th.id = _table.tHead.id + '-' + columnDefinition.field || headerRow.cells.length;
            headerRow.appendChild(th);

            if(columnDefinition.header) {
                th.innerText = columnDefinition.header.text || '';
                _setAttributes(th, columnDefinition.header.attributes);
            }

            grid.onHeaderCellCreated(th, columnDefinition); 
        }
    };

    grid.body = {
        create : function(data, columns = options.columns) {
            let tBody = grid.body.initialize(columns);

            for(let idx in data) {
                grid.body.addTableRow(tBody, idx, data[idx]);
            }

            grid.onTableBodyCreated(tBody, tBody.options);
        }
        , initialize : function(columns) {  
            while(_table.tBodies.length) { _table.removeChild(_table.tBodies[0]); }
            let tBody = _table.createTBody();
            tBody.id = _table.id + '-tbody';
            tBody.options = columns;
            return tBody;
        }
        , _parseColumns : function(columns) {
            return columns.map(col => {
            });
        }
        , clear : function() { _clear(_table.tBodies[0]); }
        , getColumnDefinition : function(field) {
            let colDefs = _table.tBodies[0].options;
            if(!colDefs) { return; }
            return colDefs.find(d => d.field == field);
        }
        , addTableRow : function(tBody, ridx, rowData) {
            let tr = tBody.insertRow();
            tr.id = tBody.id + '-' + ridx;

            let colDefs = tBody.options;
            if(colDefs){
                for(let d in colDefs) {
                    let field = colDefs[d].field;
                    grid.body.addTableCell(tr, field, rowData[field]);
                }
            }
            else { 
                for(let field in rowData) {
                    grid.body.addTableCell(tr, field, rowData[field]);
                }
            }

            grid.onTableRowCreated(tr);
        }
        , addTableCell : function(tr, field, value) {
            let td = tr.insertCell();
            td.id = tr.id + '-' + field;

            td.field = field;
            td.value = value;
            td.innerText = value;

            let colDef = grid.body.getColumnDefinition(field);
            if(colDef && colDef.attributes) { _setAttributes(td, colDef.attributes); }
            if(colDef && colDef.click) { td.onclick = colDef.click; }

            grid.onTableCellCreated(td, colDef);
        }
    };

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
    };

    grid.footer = { 
        create : function(columns) {
            if(!columns) { return ; }
            let tFoot = grid.footer.initialize(columns);

            grid.footer.addFooterCells();

            grid.onFooterCreated(tFoot, tFoot.options);
        }
        , initialize : function(columns) {
            if(_table.tFoot) { _table.removeChild(_table.tFoot); }
            let tFoot = _table.createTFoot();
            
            tFoot.id = _table.id + '-tfoot';
            tFoot.options = grid.footer._parseOptions(columns);            
            return tFoot;
        }
        , _parseOptions : function(columns) {
            return columns.map(opt => { 
                if(typeof(opt.footer) === 'string') {
                    opt.footer = { text : opt.footer };
                }
                return opt;
            });
        }
        , addFooterCells : function() {
            let fr = _table.tFoot.insertRow();
            _table.tFoot.options
                .forEach(o => { grid.footer.addFooterCell(fr, o); });
        }
        , addFooterCell : function(footerRow, columnDefinition) {
            let td = footerRow.insertCell();
            td.id = _table.tFoot.id + '-' + columnDefinition.field || footerRow.cells.length;

            if(columnDefinition.footer) {
                td.innerText = columnDefinition.footer.text || '';
                _setAttributes(td, columnDefinition.footer.attributes);
            }

            grid.onFooterCellCreated(td, columnDefinition);
        }
    };

    for(var k in grid.extensions) {
        grid.extensions[k].apply(grid, arguments);
    }

    grid.create(options);

    return grid;
};

Gridify.prototype.extensions = {
    filtering : filtering,
    sorting : sorting,
    paging : paging,
    styling : styling
};

const GridifyTests = function() {
    describe('Table Creation', function() {
        let assert = chai.assert;

        describe('Initialization', function() {
            it('Should create a <table> element accessible through the .html property', function() {
                let grid = new Gridify();
                assert.exists(grid.html);
            });
            it('Should attach the html table to a container if one is provided');
        });

        describe('Caption', function() {
            it('Should create an empty <caption> if .caption is present', function() {
                let grid = new Gridify({ caption : { text : '' }});
                assert.exists(grid.html.caption);
            });
            it('Should not create a <caption> element if .caption is undefined', function() {
                let grid = new Gridify();
                assert(!grid.html.caption);
            });
            it('Should set caption text if .caption is a string', function() { 
                let grid = new Gridify({ caption : 'test caption 1' });
                assert(grid.html.caption.innerText === 'test caption 1');
            });
            it('Should set caption text if .caption.text is set', function() {
                let grid = new Gridify({ caption : { text : 'test caption 2' }});
                assert(grid.html.caption.innerText === 'test caption 2');
            });
            it('Should set attributes if .caption.attributes is set', function() { 
                let grid = new Gridify({
                    caption : {
                        text : 'test',
                        attributes : { title : 'test caption' }
                    }
                });
                assert(grid.html.caption.title === 'test caption');
            });
            it('Should call onCaptionCreated after the caption has been created', function(done) {
                new Gridify({
                    caption : 'cap',
                    onCaptionCreated : function(caption, captionOptions) { 
                        assert(caption.innerText === 'cap');
                        done();
                    }
                });
            });
        });

        describe('Headers', function() {
            it('Should create an textless th if the column does not have a .header', function() { 
                let grid = new Gridify({
                    columns : [ { field : 'a' } ],
                    data : [ { a : 1 } ]
                });
                assert(grid.html.tHead.rows[0].cells[0].innerText === '');
            });
            it('Should create a th element with text if the column .header is a string', function() {
                let grid = new Gridify({
                    columns : [ { field : 'a' }, { field : 'b', header : 'B' } ],
                    data : [ { a : 1, b : 2 } ] 
                });
                assert(grid.html.tHead.rows[0].cells[1].innerHTML === 'B');
            });
            it('Should create a th with text if the column has a .header object with a .text property', function() {
                let grid = new Gridify({
                    columns : [ { field : 'a' }, { field : 'b', header : 'B' }, { field : 'c', header : { text : 'C' } } ],
                    data : [ { a : 1, b : 2, c : 3 } ] 
                });
                assert(grid.html.tHead.rows[0].cells[2].innerHTML === 'C');
            });
            it('Should set attributes on th if header definition contains .attributes', function() {
                let grid = new Gridify({ 
                    columns : [ { header : { text : 'A', attributes : { title : 'test three' } } } ] 
                });
                assert(grid.html.tHead.rows[0].cells[0].title === 'test three');
            });
            it('Should call onHeaderCellCreated after each header cell has been added', function(done) {
                new Gridify({
                    columns : [ { header : 'test' } ]
                    , onHeaderCellCreated : function(th, definition) { 
                        assert(th.innerText === 'test');
                        done();
                    }
                });
            });
            it('Should call onHeaderCreated after the header has been created', function(done) {
                new Gridify({
                    columns : [ { header : 'test 1' }, { header : { text : 'test 2' } } ],
                    onHeaderCreated : function(tHead, headers) { 
                        assert(tHead.rows[0].cells.length === 2);
                        done();
                    }
                });
            });
        });

        describe('Body', function() { 
            it('Should create an empty <tbody> on initializiation', function() {
                let grid = new Gridify({});
                assert.exists(grid.html.tBodies[0]);
            });
            it('Should populate the tBody with rows based on the .data property', function() {
                let grid = new Gridify({
                    data : [
                        { fieldA : 1, fieldB : 'b' }, 
                        { fieldA : 2, fieldB : 'b2' }
                    ]
                });
                assert(grid.html.tBodies[0].rows[0].cells[0].innerText == '1');
            });
            it('Should populate based on column definitions is .columns is provided', function() {
                let grid = new Gridify({
                    data : [ { fieldA : 1, fieldB : 'b' } ],
                    columns : [ { field : 'fieldB' } ]
                });
                assert(grid.html.tBodies[0].rows[0].cells[0].innerText === 'b');
            });
            it('Should set attributes on cells if .columns[x].attributes is set', function() {
                let grid = new Gridify({
                    data : [ { fieldA : 1 } ],
                    columns : [ { field : 'fieldA', attributes : { title : 'one' } } ]
                });
                assert(grid.html.tBodies[0].rows[0].cells[0].title === 'one');
            });
            it('Should call onTableBodyCreated after the body has been created', function(done) {
                new Gridify({
                    onTableBodyCreated : function(tBody, columns) {
                        assert(tBody.id === 'new-grid-tbody');
                        done();
                    }
                });
            });
            it('Should call onTableRowCreated after a table row has been added', function(done) {
                new Gridify({
                    data : [ { fieldA : 'test 1' } ],
                    onTableRowCreated : function(tr, colDef) { 
                        assert(tr.cells[0].innerText === 'test 1');
                        done();
                    }
                });
            });
            it('Should call onTableCellCreated after a table cell has been added', function(done) {
                new Gridify({
                    data : [ { fieldA : 'test 2' } ],
                    onTableCellCreated : function(td, colDef) {
                        assert(td.innerText === 'test 2');
                        done();
                    }
                });
            });
            it('Should execute a click event if .click is set on the column definition', function(done) { 
                let grid = new Gridify({
                    columns : [
                        { field : 'a', header : 'A', click : () => { done(); }}
                    ],
                    data : [ { a : 1 } ]
                });
                grid.html.tBodies[0].rows[0].cells[0].click();
            });
        });

        describe('Data', function() {
            it('Should return a data object array when .get() is called', function() {
                let grid = new Gridify({
                    data : [
                        { fieldA : 1, fieldB : 'b' },
                        { fieldA : 2, fieldB : 'b2' }
                    ]
                });
                let data = grid.data.get();
                assert(data[1].fieldA == 2);
            });
            it('Should call .body.create(data) and redraw the grid when .set(data) is called', function() {
                let grid = new Gridify({
                    data : [{ fieldA : 3 }]
                });
                grid.data.set([
                    { fieldA : 4 }
                ]);
                let data = grid.data.get();
                assert(data[0].fieldA == 4);
                
            });
            it('Should return a datarow when getRowData(tr) is called', function() {
                let grid = new Gridify({
                    data : [
                        { fieldA : 1 }, { fieldA : 2 }, { fieldA : 3 }
                    ]
                });
                let dr = grid.data.getRowData(grid.html.tBodies[0].rows[2]);
                assert(dr.fieldA == 3);
            });
        });

        describe('Footers', function() { 
            it('should contain some footer tests');
        });
    });
};

const PagingTests = function() {
    describe('Paging', function(){
        let assert = chai.assert;
        
        // Running slow. 

        it('Limits visible results when paging is true', function() {
            let grid = new Gridify({
                columns : [ { field : 'Col' } ],
                data : [ { Col : '1' }, { Col : '2' }, { Col : '3' } ],
                paging : { rows : 2 }
            });

            let rows = Array.from(grid.html.tBodies[0].rows);
            rows = rows.filter(r => r.style.display === '');
            assert.isTrue(rows.length === 2);
        });
        it('Allows displayed total pages/rows to be overriden');
        it('Can have the page be set programmatically', function() {
            let grid = new Gridify({
                columns : [ { field : 'Col' } ],
                data : [ { Col : '1' }, { Col : '2' }, { Col : '3' } ],
                paging : { rows : 2, currentPage : 1 }
            });

            grid.paging.page(2);
            let rows = Array.from(grid.html.tBodies[0].rows);
            rows = rows.filter(r => r.style.display === '');
            assert.isTrue(rows.length === 1);
        
        });
        it('Can be set after initialization');
    });
};

const SortingTests = function() {
    describe('Sorting', function(){
        let assert = chai.assert;

        let newgrid = function(id){
            let div = document.createElement('div');
            div.id = id;
            div.style.display = 'none';
            document.body.appendChild(div);
            return new Gridify(id);
        };

        it('Appends a sort icon on sortable columns', function() {
            let grid = new Gridify({
                columns : [ { sort : true, header : 'Col' } ]
            });
            assert.isTrue(grid.html.tHead.rows[0].cells[0].children[0].className == 'sort');
        });

        it('Defaults to alphabetical sorting.', function() {
            let grid = new Gridify({
                columns : [ { field : 'Col', sort : true, header : 'col' } ],
                data : [{ Col : 'b' }, { Col : 'c' }, { Col : 'a' }]
            });
            let data = grid.data.get();
            assert(data[0].Col === 'b' && data[2].Col === 'a');
            grid.sorting.sort('Col');
            data = grid.data.get();
            assert(data[0].Col === 'a' && data[2].Col === 'c');
            grid.sorting.sort('Col'); // reverse
            data = grid.data.get();
            assert(data[0].Col === 'c' && data[2].Col === 'a');
        });

        let compare = function(a, b) { 
            return +a[1] <= +b[1] ? 1 : -1;
        };

        it('Allows for custom sorting if sort option is a comparer function', function(){
            let grid = newgrid({
                columns : [ { field : 'Col', header : 'Col', sort : compare } ],
                data : [ { Col : 'a3' }, { Col : 'b2' }, { Col : 'c1' } ]
            });      
            
            grid.sorting.sort('Col');   
            assert.isTrue(grid.data.get()[0].Col == 'c1');
            grid.sorting.sort('Col');   
            assert.isTrue(grid.data.get()[0].Col == 'a3');     
        });

    });
};

const StylingTests = function() {
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
                assert(grid.html.style.borderWidth === 'thin');
            });
            it('Should set the css style of the body cells if .style is set in the column definition', function() { 
                let grid = new Gridify({
                    columns : [ { field : 'colA', style : 'font-weight:bold' } ],
                    data : [ { colA : 123 } ]
                });
                assert(grid.html.tBodies[0].rows[0].cells[0].style.fontWeight === 'bold');
            });
            it('Should set the css style of the header cells if .style is set in the header options', function() {
                let grid = new Gridify({
                    columns : [ { header : { text : 'test header', style : 'font-weight:bold;' } } ]
                });
                assert(grid.html.tHead.rows[0].cells[0].style.fontWeight === 'bold');
            });
            it('Should set the css style of the footer cells if .style is set in the footer options', function() { 
                let grid = new Gridify({
                    columns : [ { footer : { text : 'test footer', style : 'font-weight:bold' } } ]
                });
                assert(grid.html.tFoot.rows[0].cells[0].style.fontWeight === 'bold');
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
};

const FilteringTests = function() {
    describe('Filtering', function(){
        let assert = chai.assert;

        it('Adds a filter textbox on filterable columns', function() {
            let grid = new Gridify({
                columns : [ { field : 'Col', header : 'Col', filter : true } ],
                data : [ { Col : 'a' } ]
            });
            assert.isTrue(grid.html.tHead.rows[1].cells[0].firstChild != undefined);
        });
        it('Defaults to xyz% filtering function', function(){
            let grid = new Gridify({
                columns : [ { field : 'Col', header : 'Col', filter : true } ],
                data : [ { Col : 'aab' }, { Col : 'abc' }, { Col : 'bca'}]
            });

            let filterTextbox = grid.html.tHead.rows[1].cells[0].firstChild;
            filterTextbox.value = 'a';
            grid.filtering.filter();
            assert.isTrue(
                Array.from(grid.html.tBodies[0].rows)
                    .filter(r => r.style.display == 'none').length == 1
            );
            filterTextbox.value = 'aa';
            grid.filtering.filter();
            assert.isTrue(
                Array.from(grid.html.tBodies[0].rows)
                    .filter(r => r.style.display == 'none').length == 2
            );
        });
        it('Applies all filters to the data set', function() {
            let grid = new Gridify({
                columns : [ 
                    { field : 'ColA', header : 'Col A', filter : true }, 
                    { field : 'ColB', header : 'Col B', filter : true } 
                ],
                data : [ 
                    { ColA : 'a', ColB : 'a' }, 
                    { ColA : 'a', ColB : 'b' }, 
                    { ColA : 'b', ColB : 'a' },
                    { ColA : 'b', ColB : 'b' } ]
            });

            grid.html.tHead.rows[1].cells[0].firstChild.value = 'a';
            grid.html.tHead.rows[1].cells[1].firstChild.value = 'b';
            grid.filtering.filter();
            assert.isTrue(
                Array.from(grid.html.tBodies[0].rows)
                    .filter(r => r.style.display == 'none').length == 3
            );
        });
        it('Allows for custom filter logic', function() {
            let grid = new Gridify({
                columns : [ 
                    { 
                        field : 'Col', 
                        header : 'Col A',
                        filter : { 
                            rule : (cellValue, filterValue) => {
                                return cellValue.includes(filterValue);
                            }
                        }
                    } 
                ],
                data : [ { Col : 'abcd' }, { Col : 'dcba' } ]
            });

            grid.html.tHead.rows[1].cells[0].firstChild.value = 'bc';
            grid.filtering.filter();
            assert.isTrue(
                Array.from(grid.html.tBodies[0].rows)
                    .filter(r => r.style.display == 'none').length == 1
            );
        });
        it('Allows for custom filter control', function() {
            let ddl = document.createElement('select');
            let s0 = document.createElement('option');
            s0.value = 0; s0.innerHTML = 'zero';
            ddl.appendChild(s0);
            let s1 = document.createElement('option');
            s1.value = 1; s1.innerHTML = 'one';
            ddl.appendChild(s1);
            let s2 = document.createElement('option');
            s2.value = 2; s2.innerHTML = 'two';
            ddl.appendChild(s2);
            
            let grid = new Gridify({ 
                columns : [ 
                    { 
                        field : 'Col', 
                        header : 'Col A',
                        filter : {
                                control : ddl,
                                rule : function(cellValue, filterValue) {
                                    if(+filterValue === 0) { return true; }
                                    return +filterValue === +cellValue;
                                },
                                event : 'change'
                            }
                        }  
                    ],
                data : [ { Col : 1 }, { Col : 2 }, { Col : 3 } ]
            });

            grid.html.tHead.rows[1].cells[0].firstChild.value = 1;
            grid.filtering.filter();
            assert.isTrue(
                Array.from(grid.html.tBodies[0].rows)
                    .filter(r => r.style.display == 'none').length == 2);
        });
    });
};

export { FilteringTests, GridifyTests, PagingTests, SortingTests, StylingTests };

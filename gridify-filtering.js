
Gridify.prototype.extensions.filtering = function(div){
    let grid = this;

    let onHeaderCreated = grid.onHeaderCreated;
    grid.onHeaderCreated = function(header, headers) {
        let hasFilters = headers.some(h => h.filter);
        if(hasFilters) { grid.filtering.addFilters(headers); }
        
        onHeaderCreated(header, headers);
    }


    let filterPending = 0;
    let filterDelay = function(callback) {
        return function(field_value, filter_value) {
            clearTimeout(filterPending);
            filterPending = setTimeout(()=>{ callback(field_value, filter_value); }, 150);
        }
    }

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
                grid.filtering.addFilter(th, idx, headers[idx].filter)
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
                row.style.display = filteredOut ? 'none' : ''
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
            }
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
    }
}
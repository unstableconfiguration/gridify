
Gridify.prototype.extensions.filtering = function(div){
    let grid = this;

    let onHeaderInitialized = grid.header.onInitialized;
    grid.header.onInitialized = function(header_options) {
        onHeaderInitialized(); 

        let filter_row = grid.table.tHead.insertRow();
        filter_row.id = grid.table.id + '_filters'
    }

    let onColumnAdded = grid.header.onColumnAdded;
    grid.header.onColumnAdded = function(headerCell, columnDefinition){
        onColumnAdded(headerCell, columnDefinition);

        grid.filtering.addFilter(columnDefinition.field, columnDefinition.filter);
    }

    let filterPending = 0;
    let filterDelay = function(callback) {
        return function(field_value, filter_value) {
            clearTimeout(filterPending);
            filterPending = setTimeout(()=>{ callback(field_value, filter_value); }, 150);
        }
    }

    grid.filtering = { 
        addFilter : function(field, options) {
            let cell = grid.filtering._addFilterCell(field)
            if(!options) { return; }
            options = grid.filtering._getFilterOptions(field, options);

            let control = options.control;
            control.rule = options.rule;
            control.property = field;
            control.addEventListener(options.event, filterDelay(grid.filtering.filter));
            cell.appendChild(control);
        }
        , cells : function() { return Array.from(grid.table.tHead.rows[1].cells); }
        , filter : function(){
            let filterControls = grid.filtering.getControls();
            let gridData = grid.data.get();
            
            grid.body.rows.forEach((row, i)=>{
                let filteredOut = filterControls.some((filterControl)=>{
                    let cellValue = gridData[i][filterControl.property];
                    return !filterControl.rule(cellValue, filterControl.value);
                });
                row.filtered = filteredOut;
                row.style.display = filteredOut ? 'none' : ''
            }); 
        }
        , getControls : function(){
            return grid.filtering.cells().map(cell => cell.firstChild).filter(x => !!x);
        }
        , _addFilterCell : function(field) {
            let cell = grid.table.tHead.rows[1].insertCell();
            cell.id = grid.table.id + '_filters_' + field;
            return cell;
        }
        , defaultFilterRule : function(cellValue, fieldValue) {
            return (''+cellValue).toLowerCase()
                .substr(0, fieldValue.length) === fieldValue.toLowerCase();
        }
        , _getFilterOptions : function(field, options) { 
            if(typeof(options) === 'function') { options = { rule : options } };
            if(typeof(options) !== 'object') { options = { } };

            options.rule = options.rule || grid.filtering.defaultFilterRule;
            options.control = options.control || grid.filtering._getDefaultFilterControl(field);
            options.event = options.event || 'keyup';

            return options;
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
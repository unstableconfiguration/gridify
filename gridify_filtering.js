
Gridify.prototype.extensions.filtering = function(div){
    let grid = this;

    // add header row 
    let on_header_initialized = grid.header.onInitialized;
    grid.header.onInitialized = function(header_options){
        let filter_row = grid.table.tHead.insertRow();
        filter_row.id = grid.table.id + '_filters'
    }

    let onColumnAdded = grid.header.onColumnAdded;
    grid.header.onColumnAdded = function(header_cell, column_definition){
        onColumnAdded(header_cell, column_definition);
        let filter_cell = grid.table.tHead.rows[1].insertCell();
        if(!column_definition.filter) return;
        filter_cell.id = grid.table.id + '_filters_' + column_definition.field;
        grid.filtering.add_filter(filter_cell, column_definition.field, column_definition.filter);
    }

    let filter_pending = 0;
    let filter_delay = function(callback) {
        return function(field_value, filter_value) {
            clearTimeout(filter_pending);
            filter_pending = setTimeout(()=>{ callback(field_value, filter_value); }, 150);
        }
    }
    grid.filtering = { 
        filter : function(){
            let filter_controls = grid.filtering.filter_controls();
            let grid_data = grid.data.get();
            
            grid.body.rows.forEach((row, i)=>{
                let filtered_out = filter_controls.some((filter_control)=>{
                    let cell_value = grid_data[i][filter_control.property];
                    return !filter_control.rule(cell_value, filter_control.value);
                });
                row.filtered = filtered_out;
                row.style.display = filtered_out ? 'none' : ''
            }); 
        }
        , filter_callback : function() {
            return filter_delay(grid.filtering.filter());
        }
        , cells : function() { return Array.from(grid.table.tHead.rows[1].cells); }
        , filter_controls : function(){
            return grid.filtering.cells().map(cell => cell.firstChild).filter(x => !!x);
        }
        , add_filter : function(filter_cell, field_name, options) {
            options = grid.filtering._set_default_options(field_name, options);
            let control = options.control;
            control.rule = options.rule;
            control.property = field_name;
            control.addEventListener(options.event, grid.filtering.filter_callback);
            filter_cell.appendChild(control);
        }
        , _set_default_options : function(field_name, options){
            if(typeof(options) !== 'object') options = {};
            options.rule = options.rule || grid.filtering._default_filter_rule;
            options.control = options.control || grid.filtering._default_filter_control(field_name);
            options.event = options.event || 'keyup';
            return options;
        }
        , _default_filter_rule : function(x, y){ 
            return (''+x).toLowerCase().substr(0, y.length) == y.toLowerCase();
        }
        , _default_filter_control : function(property_name){
            let control = document.createElement('input');
            control.type = 'text';
            control.id = grid.table.id + '_filter_' + property_name;
            control.style = 'width: 80%; display: block; margin: auto;'
            return control;
        }
    }
}
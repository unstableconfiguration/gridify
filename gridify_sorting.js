

Gridify.prototype.extensions.sorting = function(div){
    let grid = this;

    let on_column_added = grid.header.on_column_added;
    grid.header.on_column_added = function(header_cell, column_definition){
        on_column_added(header_cell, column_definition);
        if(!column_definition.sort) return;
        let sort_icon = header_cell.appendChild(document.createElement('span'));
        sort_icon.className = 'sort'
        header_cell.style.paddingRight = '30px';
        header_cell.addEventListener('click', grid.sorting.sort_callback(column_definition.field, column_definition.sort));
    }

    grid.sorting = {
        sort : function(property_name, options = {}) {
            options = grid.sorting._set_default_options(options);
            let dir = grid.sorting._column_sort_direction(property_name, options);
            let rows = grid.body.rows();
            rows.sort((x,y)=>{
                let xv = grid.data.get_cell_value(x, property_name);
                let yv = grid.data.get_cell_value(y, property_name);
                let compared = options.comparator(xv, yv);
                return +compared * dir;
            });
            
            grid.body.clear();
            let tbody = grid.table().tBodies[0];
            rows.forEach(x=>tbody.appendChild(x));
        }
        , sort_callback : function(property_name, options){
            return ()=>{ grid.sorting.sort(property_name, options); }
        }
        , _set_default_options : function(options){
            if(typeof(options) !== 'object') options = {};
            if(!options.comparator) options.comparator = grid.sorting._default_comparator;
            return options;
        }
        , _default_comparator : function(a, b) { if(a==b) return 0; return a<b ? 1 : -1; }
        , _column_sort_direction : function(property_name, options) {
            let sort_span = grid.header.find_cell(property_name).children[1];
            sort_span.direction = sort_span.direction !== 'asc' ? 'asc' : 'desc';
            return sort_span.direction === 'asc' ? -1 : 1;
        }   
    }
}

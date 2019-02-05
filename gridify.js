



let Gridify = function(container){   
    let GridifyModel = function(container){
        if(typeof(container)==='string') container = document.getElementById(container);
        if(!container instanceof HTMLDivElement) 
            throw('Gridify container must be <div>');
        this.container = container;
        return this;
    }

    let grid = new GridifyModel(container);
    grid.table = () => grid.container.firstChild;
    let _clear = (container)=> { if(!container) return; while(container.firstChild) container.removeChild(container.firstChild); }        

    /* Initializes grid within provided container. */
    grid.initialize = function(options){
        _clear(grid.container);
        grid.container
            .appendChild(document.createElement('table'))
            .id = grid.container.id +'_table';
        
        grid.header.initialize(options);
        grid.body.initialize();
        grid.footer.initialize();
        
        if(options.columns) grid.header.add_columns(options.columns);
        if(options.data) grid.data.set(options.data);
    }

    grid.data = {
        get : function() {
            /* build data table from existing grid rows */
        },
        set : function(input_data) {
            let data = [];
            if(Array.isArray(input_data)) data = input_data;
            else if(typeof(input_data)==='object')
                for(let k in input_data) data.push(input_data[k]);

            data.forEach((row_data, ridx)=>{
                grid.body.add_row(row_data, ridx);
            });
        }
        , get_fields : function() {
            return grid.header.cells().map(x => x.id.split('_').slice(-1));
        }
        , get_cell_value : function(row, property){
            if(typeof(row)==='number') row = grid.body.rows()[row];
            let cells = Array.from(row.cells);
            let cell = cells.find(x=>x.id.split('_').slice(-1)==property);
            return cell.innerText;
        }
    }

    grid.header = {
        initialize : function(options){
            let tHead = grid.table().createTHead();
            tHead.insertRow(); // Label 
            tHead.insertRow(); // Filter
        }
        , cells : function() { return Array.from(grid.table().tHead.rows[0].cells); }
        , add_columns : function(column_definitions){
            if(!Array.isArray(column_definitions)) 
                throw`.columns.set requires an array of column definitions`;

            column_definitions.forEach(col => {
                grid.header.add_column(col);
            });
        }
        , add_column : function(column_definition){
            let header_cell = grid.table().tHead.rows[0].insertCell();
            header_cell.id = grid.table().id+'_header_'+column_definition.field;
            grid.header._set_header_label(header_cell, column_definition);
            grid.header._set_header_style(header_cell, column_definition);
            grid.header._set_column_sort(header_cell, column_definition);
            
            let filter_cell = grid.table().tHead.rows[1].insertCell();
            grid.header._set_column_filter(filter_cell, column_definition);
            
            grid.body.seed_row.add_column(column_definition);
        }
        , _set_header_label : function(header_cell, column_definition) {
            let label = header_cell.appendChild(document.createElement('span'));
            label.innerHTML = column_definition.header || column_definition.field;
        }
        , _set_header_style : function(header_cell, column_definition) {
            grid.styling.stylize_header_cell(header_cell, column_definition);
        }
        , _set_column_sort : function(header_cell, column_definition) {
            if(!column_definition.sort) return;
            let sort_icon = header_cell.appendChild(document.createElement('span'));
            sort_icon.className = 'sort'
            header_cell.style.paddingRight = '30px';
            header_cell.addEventListener('click', grid.sorting.sort_callback(column_definition.field, column_definition.sort));
        }
        , _set_column_filter : function(filter_cell, column_definition) {
            if(!column_definition.filter) return;
            filter_cell.id = grid.table().id+'_filter_columns_'+column_definition.field;
            grid.filters.add_filter(filter_cell, column_definition)
        }  
    }

    grid.body = {
        initialize : function(table=grid.table()) {
            let tbody = table.createTBody();
            let seed_row = tbody.insertRow();
            seed_row.id = grid.table().id + '_seed';
            seed_row.style.display = 'none';
        }
        , clear : function(){ _clear(grid.table().tBodies[0]); }
        , rows : function() { return Array.from(grid.table().tBodies[0].rows); }
        , _set_body_cell : function(body_cell, value, column_definition) {
            let label = body_cell.appendChild(document.createElement('span'));
            label.innerHTML = value;
        }
        , add_row : function(row_data, rowid) {
            let row = grid.body.seed_row.clone();
            row.id = grid.table().id+'_'+rowid;
            grid.table().tBodies[0].appendChild(row);
            Array.from(row.cells).forEach((cell)=>{
                let field = cell.id.split('_').slice(-1);
                cell.id = row.id + '_' + field;
                cell.innerHTML = row_data[field];
            });
        }
        , seed_row : {
            clone : function() {
                let seed = Array.from(grid.body.rows()).slice(-1)[0];
                let row = seed.cloneNode(true);
                row.style. display = '';
                Array.from(seed.cells).forEach((scell, cidx)=>{
                    let cell = row.cells[cidx];
                    cell.addEventListener('click', scell.onclick);
                });
                return row;       
            }
            , add_column(column_definition){
                let tr = grid.body.rows()[0];
                let td = tr.insertCell();
                td.id = tr.id+'_'+column_definition.field;
                td.innerHTML = 'test';
                grid.styling.stylize_body_cell(td, column_definition);
                if(column_definition.click)
                    td.onclick = column_definition.click;
            }
        }
    }

    grid.footer = {
        initialize : function(){
            grid.table().createTFoot();
        }
    }

    grid.styling = {
        defaults : { 
            tbody : {
                tr : `` // border bottom
                , td : `border-bottom:solid thin;padding:.08rem .25rem;overflow:hidden;text-align:left;text-overflow:ellipses;white-space:nowrap`
            }
            , thead : {
                tr : ``
                , td : `font-weight:bold; text-align:center; padding:4px 16px 4px 16px;` 
            }
        }
        , stylize : function(el, style) {
            (style||'').split(';')
                .map(x => x.trim().split(':'))
                .forEach(kv => el.style[kv[0]]=kv[1]);
        }
        , stylize_header_cell : function(td, col) {
            grid.styling.stylize(td, grid.styling.defaults.thead.td);
            // 'all columns' options
            grid.styling.stylize(td, col.header_style);
        }
        , stylize_body_cell: function(td, col) {
            grid.styling.stylize(td, grid.styling.defaults.tbody.td);
            // all cols 
            grid.styling.stylize(td, col.style);
        }
    }

    grid.sorting = {
        sort : function(property_name, options) {
            options = grid.sorting.set_default_options(options);
            let asc = grid.sorting.column_sort_direction(property_name, options.parse);
            let rows = grid.body.rows();
            rows.sort((x,y)=>{
                let xv = grid.data.get_cell_value(x, property_name);
                let yv = grid.data.get_cell_value(y, property_name);
                let compared = options.compare(xv, yv, options);
                return +compared * asc;
            });
            
            grid.body.clear();
            let tbody = grid.table().tBodies[0];
            rows.forEach(x=>tbody.appendChild(x));
        }
        , sort_callback : function(property_name, options){
            return ()=>{ grid.sorting.sort(property_name, options); }
        }
        , set_default_options : function(options){
            let sort_options = {}
            sort_options.compare = options.compare || 
                function(a, b){ if(a==b)return 0; return a<b ? -1 : 1; };
            sort_options.parse = options.parse || null;
            return sort_options;
        }
        , column_sort_direction : function(property_name, parse) {
            let v1 = grid.data.get_cell_value(0, property_name);
            let v2 = grid.data.get_cell_value(grid.body.rows().length-1, property_name);
            if(parse){
                v1 = parse(v1);
                v2 = parse(v2);
            }
            return v1 < v2 ? -1 : 1;
        }
        
    }


    let filter_pending = 0;
    let filter_delay = function(callback) {
        return function(field_value, filter_value) {
            clearTimeout(filter_pending);
            filter_pending = setTimeout(()=>{ callback(field_value, filter_value); }, 150);
        }
    }
    grid.filters = { 
        add_filter : function(filter_cell, column_definition) {
            let rule = column_definition.filter == true ? grid.filters._default_filter_rule : column_definition.filter;
            let control = column_definition.filter_control || grid.filters._default_filter_control(column_definition.field);

            control.rule = rule;
            control.property = column_definition.field;
            control.addEventListener('keyup', filter_delay(grid.filters.filter_callback));  
            filter_cell.appendChild(control);
        }
        , cells : function() { return Array.from(grid.table().tHead.rows[1].cells); }
        , _default_filter_rule : function(x, y){ 
            return (''+x).toLowerCase().substr(0, y.length) == y.toLowerCase();
        }
        , _default_filter_control : function(property_name){
            let control = document.createElement('input');
            control.type = 'text';
            control.id = grid.table().id + '_filter_' + property_name;
            control.style.width = '80%';
            control.style.display = 'block';
            control.style.margin = 'auto';
            return control;
        }
        , filter_callback : function() {
            let filter_controls = grid.filters.cells()
                .map((cell) => { return cell.firstChild; })
                .filter(x => !!x);
            grid.body.rows().forEach((row, i)=>{
                let filtered_out = filter_controls.some((filter_control)=>{
                    return !filter_control.rule(
                        grid.data.get_cell_value(i, filter_control.property), filter_control.value)
                });
                row.style.display = filtered_out ? 'none' : ''
            });
        }
    }

    // paging 
    grid.paging = { 
        // grid needs a footer. 
        // we can just hide rows after redraws. 
            // it's going to have to interact with sorting and filters
            // sorting: picks up all the rows, sorts them, adds them back in. 
            // filters: hides invalid cells. 
            // after they are done, paging would need to be applied. 
            
    }
    
    return grid;
}

//return Gridify;


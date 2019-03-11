



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
        grid.paging.initialize(options.paging);
    }

    grid.data = {
        get : function() {
            /* build data table from existing grid rows */
            console.log('retrieve data placeholder')
            return [1, 2, 3, 4];
        },
        set : function(input_data) {
            let data = [];
            if(Array.isArray(input_data)) data = input_data;
            else if(typeof(input_data)==='object')
                for(let k in input_data) data.push(input_data[k]);

            grid.body.clear();
            data.forEach((row_data, ridx)=>{
                grid.body.add_row(row_data, ridx);
            });
        }
        , get_fields : function() {
            return grid.header.cells().map(x => x.id.split('_').slice(-1));
        }
        , get_cell_value : function(row, property){
            if(typeof(row)==='number') row = grid.body.rows()[row];
            return Array.from(row.cells)
                .find(x=>x.id.split('_').slice(-1)==property)
                .innerText;
        }
    }

    grid.header = {
        initialize : function(options){
            let tHead = grid.table().createTHead();
            tHead.insertRow(); // Label 
            tHead.insertRow(); // Filter
        }
        , cells : function() { return Array.from(grid.table().tHead.rows[0].cells); }
        , find_cell : function(property_name) { 
            return grid.header.cells().find(c => c.id.split('_').pop() === property_name); 
        }
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
            grid.filtering.add_filter(filter_cell, column_definition.field, column_definition.filter)
        }  
    }

    grid.body = {
        initialize : function(table=grid.table()) {
            let main_body = table.createTBody();
            
            grid.body.seed_row.initialize();
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
            initialize : function(){
                let seed_body = grid.table().createTBody();
                let seed_row = seed_body.insertRow();
                seed_row.id = grid.table().id + '_seed';
                seed_row.style.display = 'none';
            }
            , clone : function() {
                let seed = grid.table().tBodies[1].rows[0];
                let row = seed.cloneNode(true);
                row.style. display = '';
                Array.from(seed.cells).forEach((scell, cidx)=>{
                    let cell = row.cells[cidx];
                    cell.addEventListener('click', scell.onclick);
                });
                return row;       
            }
            , add_column(column_definition){
                window.grid = grid;
                let tr = grid.table().tBodies[1].rows[0];
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
        initialize : function() {
            grid.table().createTFoot();
        }
        , pager : {
            initialize : function(options){
                let paging_row = grid.table().tFoot.insertRow();
                paging_row.id = grid.table().id + '_paging';
                paging_row.options = JSON.stringify(options);                

                let left_cell = paging_row.insertCell();
                left_cell.id = grid.table().id + '_paging_left';
                left_cell.style = 'width:33%;';

                let center_cell = paging_row.insertCell();
                center_cell.id = grid.table().id + '_paging_center';
                center_cell.style = 'width:33%;';
                center_cell.appendChild(grid.footer.pager.center_cell_control(options));

                let right_cell = paging_row.insertCell();
                right_cell.id = grid.table().id + '_paging_right';
                right_cell.style = 'width:33%'    
            }
            , set_page : function(page_number){
                let textbox = document.getElementById(grid.table().id + '_paging_center_textbox');
                if(textbox) textbox.value = page_number;
                // set row counter when up
            }
            , center_cell_control : function(options){
                let container = document.createElement('div');
                container.style = 'width:120px'

                let textbox = document.createElement('input');
                textbox.id = grid.table().id + '_paging_center_textbox';
                textbox.className = 'pager_textbox';
                textbox.value = options.current_page || 1;

                let label = document.createElement('span');
                label.style = 'width:40px;vertical-align:top';
                label.innerText = ' of ' + options.total_pages || 1;

                let left_arrow = document.createElement('div');
                left_arrow.className = 'pager_left';
                left_arrow.onclick = () => 
                    grid.paging.page(textbox.value > 1 ? +textbox.value -1 : 1);
                
                let right_arrow = document.createElement('div');
                right_arrow.className = 'pager_right';
                right_arrow.onclick = () => 
                    grid.paging.page(textbox.value < options.total_pages ? +textbox.value+1 : options.total_pages); 

                container.appendChild(left_arrow);
                container.appendChild(textbox);
                container.appendChild(label);
                container.appendChild(right_arrow);

                return container;
            }
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
            grid.body.rows().forEach((row, i)=>{
                let filtered_out = filter_controls.some((filter_control)=>{
                    let cell_value = grid.data.get_cell_value(i, filter_control.property);
                    return !filter_control.rule(cell_value, filter_control.value);
                });
                row.style.display = filtered_out ? 'none' : ''
            }); 

        }
        , filter_callback : function() {
            return filter_delay(grid.filtering.filter());
        }
        , cells : function() { return Array.from(grid.table().tHead.rows[1].cells); }
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
            control.id = grid.table().id + '_filter_' + property_name;
            control.style = 'width: 80%; display: block; margin: auto;'
            return control;
        }
    }

    grid.paging = { 
        initialize : function(options){
            if(!options) return;
            options = grid.paging._default_options(options);
            grid.footer.pager.initialize(options); 
            grid.paging.page(options.current_page);
        }
        , page : function(page_number){
            grid.paging._set_row_visibility(page_number);
            grid.paging._set_footer_values(page_number);
        }
        , _set_row_visibility : function(page_number){
            console.log(page_number);
            //reset visibility from paging
            let rows = grid.body.rows();
            // get currently visible rows 
            console.log(rows);

            // hide all but range
        }
        , _set_footer_values : function(page_number){
            grid.footer.pager.set_page(page_number);
        }
        , _default_options : function(options){
            if(typeof(options) !== 'object') options = {};
            options.rows = options.rows || 20;
            options.total_rows = options.total_rows || grid.data.get().length;
            options.total_pages = Math.ceil(options.total_rows/options.rows);
            options.current_page = options.current_page || 1;
                // need to extract from UI if present
            return options;
        }
    }


    
    return grid;
}

//return Gridify;


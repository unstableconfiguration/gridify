

/* Thoughts and todos for paging WIP 
    Need to get paging to work with sorting and filtering. 
        * Changing the sort order willl need to retrigger the paging 
        * Changing the filters will need to retrigger the paging 
    Ideally this can be done in such a way as they are not super tightly coupled 
    but first and foremost lets get it working. 

    Questions/Answers: 
        * Does modifying filter values change the 'total rows'?
        * Probably. We're paging only over the visible/available rows unless otherwise told. 





    Need to think about server-side options for paging since that was a concern when 
    architecting it. The idea is that page forward or page backward can make a 
    call to a server API. The server API can return partial data sets, but can also 
    inform us of the total number of rows, so that we can display 'page 5 of 60' even 
    if we only have the rows for page 5 at hand. 

    Need to start splitting features off into modules. 

*/
/*  Ok, so monkey patching it. 
    Main gridify: Builds html table around a data set 
        Data access
        Header
        Footer
        Body
    
    
*/


let Gridify = function(container){   
    if(typeof(container)==='string') container = document.getElementById(container);
    if(!container instanceof HTMLDivElement) 
        throw('Gridify container must be <div>');
    
    let grid = this;
    grid.container = container;

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
            grid.header.on_initialized(options);
        }
        , on_initialized : function(options){}
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
            
            grid.header.on_column_added(header_cell, column_definition);
            grid.body.seed_row.add_column(column_definition);
        }
        , on_column_added : function(header_cell, column_definition){ 
            console.log('base column added')
            // used by extensions to further modify and add functionality to columns.
        }     
        , _set_header_label : function(header_cell, column_definition) {
            let label = header_cell.appendChild(document.createElement('span'));
            label.innerHTML = column_definition.header || column_definition.field;
        }
        , _set_header_style : function(header_cell, column_definition) {
            grid.styling.stylize_header_cell(header_cell, column_definition);
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
        , options : function() { 
            return JSON.parse(document.getElementById(grid.table().id + '_paging').options);
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

                grid.footer.options = () => options;               
            }
            , set_page : function(page_number){
                let options = grid.footer.options();
                options.current_page = page_number;

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

    grid.paging = { 
        initialize : function(options){
            if(!options) return;
            options = grid.paging._default_options(options);
            grid.footer.pager.initialize(options); 
            grid.paging.page(options.current_page);
        }
        , page : function(page_number){
            grid.paging._set_footer_values(page_number);
            grid.paging._set_row_visibility(page_number);
        }
        , _set_row_visibility : function(page_number){
            let rows = grid.body.rows();
            let options = grid.footer.options();
            // Undo previous paging 
            rows.forEach(r => { if(r.paged) { r.paged = undefined; r.style.display = ''; } });
            
            let start = (options.current_page-1)*options.rows;
            let end = options.current_page*options.rows;
            // Only page visible rows
            rows = rows.filter(r => r.style.display !== 'none');
            rows = rows.filter((r, ix) => ix >= end || ix < start);

            rows.forEach(r => {r.style.display = 'none'; r.paged = true; });

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

    for(var k in grid.extensions)
        grid.extensions[k].apply(grid, arguments);
    
    return grid;
}
Gridify.prototype.extensions = {};

//return Gridify;


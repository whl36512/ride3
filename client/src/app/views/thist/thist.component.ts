import	{	Component		}	from	'@angular/core';
import	{	ChangeDetectionStrategy	}	from	'@angular/core';
import	{ 	ChangeDetectorRef 		}	from '@angular/core';

import	{	AbstractControl	}	from	'@angular/forms';
import	{	Input			}	from	'@angular/core';
//import  {   FormControl }   from    '@angular/forms';
//import  {   FormGroup   }   from    '@angular/forms';
//import  {   FormArray   }   from    '@angular/forms';
//import  {   FormBuilder }   from    '@angular/forms';
import  {   Validators  }		from    '@angular/forms';
//import  {   ValidatorFn }		from    '@angular/forms';
//import  {   ValidationErrors}   from    '@angular/forms';

import	{	AppComponent	}	from	'../../app.component';
import	{	C				}	from	'../../models/constants';
import	{	StorageService	}	from	'../../models/gui.service';
import	{	BaseComponent	}	from	'../base/base.component'	;

@Component({
		selector		:	'app-thist'
	,	templateUrl		:	'./thist.component.html'
	,	styleUrls		:	['./thist.component.css'] 
	,	changeDetection	:	ChangeDetectionStrategy.OnPush
})

export	class	ThistComponent	extends	BaseComponent	{
	trnx_from_db	:	any	=	[]	;
	filter			:	any			;
	trans_to_show	:	any =	[]	;

	constructor( public changeDetectorRef   : ChangeDetectorRef ){
		super(changeDetectorRef);
		console.debug("201809262245	ThistComponent.constructor()	enter")	;
		this.page_name=C.PAGE_THIST;
		console.debug("201809262245	ThistComponent.constructor()	exit")	;
	}


	ngoninit()	{
		let	form_value_from_storage	=	StorageService.getForm(C.KEY_FORM_THIST);
		
		if	(!form_value_from_storage)	{

			form_value_from_storage	={	
					date1			:	''
				,	date2			:	C.TODAY()
				,	show_booking	:	true
				,	show_return		:	true
				,	show_penalty	:	true
				,	show_deposit	:	true
				,	show_withdraw	:	true
				,	show_finished	:	true
				,	show_pending	:	true
			};
        	StorageService.storeForm(C.KEY_FORM_THIST,  form_value_from_storage);
		}

		let fv=form_value_from_storage;
		
		this.form	=	this.form_builder.group({
			date1		:	[fv.date1,	[]],
			date2		:	[fv.date2,	[Validators.min]	],
			show_booking	:	[fv.show_booking,	[]	],
			show_return		:	[fv.show_return,	[]	],
			show_penalty	:	[fv.show_penalty,	[]	],
			show_deposit	:	[fv.show_deposit,	[]	],
			show_withdraw	:	[fv.show_withdraw,	[]	],
			show_finished	:	[fv.show_finished,	[]	],
			show_pending	:	[fv.show_pending,	[]	],
		});
		this.onChange();
	}

	onChange()
	{
		this.reset_msg();
		this.warning_msg='Loading ...'	;

		StorageService.storeForm(C.KEY_FORM_THIST,	this.form.value);	
		this.changeDetectorRef.detectChanges();
		let	data_from_db_observable	
			=	this.dbService.call_db(C.URL_THIST,	this.form.value);
		data_from_db_observable.subscribe(
			trnx_from_db	=>	{
				this.warning_msg=	null;
				console.debug("201810071557	ThistComponent.onChange()	trnx_from_db	="	
					,	C.stringify(trnx_from_db));
				this.trnx_from_db	=	trnx_from_db	;	
				this.info_msg =`Found ${this.trnx_from_db.length} transactions before filtering`;
				this.on_filter();
				this.changeDetectorRef.detectChanges();
			},
			error	=>	{	
				this.error_msg=	error;
				this.changeDetectorRef.detectChanges();
			}
		)
		
	}

	on_filter()
	{
		StorageService.storeForm(C.KEY_FORM_THIST,	this.form.value);	
		this.trans_to_show = [];
		this.changeDetectorRef.detectChanges();

		for	(	let	index	in	this.trnx_from_db)	{
			let t = this.trnx_from_db[index];
			if(this.show_filtered( t)) { this.trans_to_show.push (t);}
		}
		this.changeDetectorRef.detectChanges();
	}

	show_filtered(tran:	any):	boolean	{
		console.debug("201810131007	BookingsComponent.show_filtered()	tran.trnx_cd="
			,	tran.trnx_cd)	;
		let	status	=false;
		if		(tran.trnx_cd	=='P'	&&	this.form.value.show_penalty	)	status=true;
		else if	(tran.trnx_cd	=='B'	&&	this.form.value.show_booking	)	status=true;
		//else if	(tran.trnx_cd	=='J'	&&	this.form.value.show_rejected	)	status=true;
		else if	(tran.trnx_cd	=='D'	&&	this.form.value.show_deposit	)	status=true;
		else if	(tran.trnx_cd	=='W'	&&	this.form.value.show_withdraw	)	status=true;
		else if	(tran.trnx_cd	=='F'	&&	this.form.value.show_finished	)	status=true;
		else if	(tran.trnx_cd	=='R'	&&	this.form.value.show_return		)	status=true;
		//if (tran.actual_ts	==null	&&	this.form.value.show_pending	)	status=true;

		return	status;
	}
}

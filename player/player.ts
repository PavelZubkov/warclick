namespace $ {
	
	export class $my_warclick_player extends $mol_object2 {
		
		id(): string {
			return this.$.$mol_fail( new Error( 'id is not defined' ) )
		}
		
		domain(): $my_warclick_domain {
			return this.$.$mol_fail( new Error( 'domain is not defined' ) )
		}
		
		@ $mol_mem
		state() {
			return this.domain().state().doc( 'player' ).doc( this.id() )
		}
		
		name( next?: string ) {
			return String( this.state().sub( 'name' ).value( next ) ?? '' )
		}
		
		@ $mol_mem
		online_time() {
			const str = this.state().sub( 'online' ).value()
			return str ? new $mol_time_moment( String( str ) ) : null
		}

		@ $mol_mem
		online_near() {
			const moment = this.online_time()
			if( !moment ) return false
			
			const now = this.$.$mol_state_time.now( 10_000 )
			return ( now - moment.valueOf() < 10_000 )
		}
		
		online_update() {
			$mol_fiber_defer( ()=> {
				this.state().sub( 'online' ).value(
					new $mol_time_moment().toString()
				)
			} )
		}
		
	}
	
}

namespace $ {
	
	export class $my_warclick_domain extends $mol_object2 {
		
		@ $mol_mem
		state() {
			const state =  new this.$.$mol_state_shared
			state.server = $mol_const('ws://localhost:3000')
			return state
		}
		
		@ $mol_mem
		user() {
			
			let id = this.$.$mol_store_local.value( 'user' ) as string | null
			if( !id ) {
				id = Math.random().toString( 16 ).slice( 2 )
				new $mol_after_tick( ()=> this.$.$mol_store_local.value( 'user', id ) )
			}
			
			return this.person( id )
		}
		
		@ $mol_mem_key
		person( id: string ) {
			const person = new $my_warclick_person()
			person.id = $mol_const( id )
			person.domain = $mol_const( this )
			return person
		}
		
		@ $mol_mem_key
		game( id : string ) {
			const game = new $my_warclick_game()
			game.id = $mol_const( id )
			game.domain = $mol_const( this )
			return game
		}
		
		@ $mol_mem
		game_current( next? : $my_warclick_game ) {
			if ( next ) {
				this.state().doc( 'game_current' ).value( next.id() )
				return next
			}

			const id = String( this.state().doc( 'game_current' ).value() )
			if ( id ) return this.game( id )
			return this.game( $mol_guid() )
		}
	}
	
}

namespace $.$$ {

	export class $my_warclick extends $.$my_warclick {
		
		game() {
			return this.domain().game_current()
		}
		
		user() {
			return this.domain().user()
		}
		
		health_red() {
			return String( this.game().health_red() )
		}
		
		health_blue() {
			return String( this.game().health_blue() )
		}
		
		attack_red() {
			this.game().attack_red( this.user() )
		}
		
		attack_blue() {
			this.game().attack_blue( this.user() )
		}
		
		attack_enabled() {
			if ( !this.user().name() ) return false
			return true
		}

		@ $mol_mem
		team( next?: string ) {
			return this.user().team( next as 'red' | 'blue' )
		}
		
		@ $mol_mem
		name( next?: string ) {
			return this.user().name( next )
		}
		
		@ $mol_mem_key
		player_name( id : string ) {
			return this.domain().person( id ).name() + ' '
		}
				
		@ $mol_mem
		team_red_list() {
			const players = this.game().players().map( id => this.domain().person( id ) )
			const red = players.filter( p => p.team() === 'red' )
			const Players = red.map( p => this.Player( p.id() ) )
			return [ this.Team_red_title() , ... Players ]
		}
		
		@ $mol_mem
		team_blue_list() {
			const players = this.game().players().map( id => this.domain().person( id ) )
			const blue = players.filter( p => p.team() === 'blue' )
			const Players = blue.map( p => this.Player( p.id() ) )
			return [ this.Team_blue_title() , ... Players ]
		}
		
		join() {
			this.game().join( this.user() )
		}
		
		join_enabled() {
			return !this.game().player_joined( this.user() ) && this.attack_enabled()
		}
		
		leave() {
			this.game().leave( this.user() )
		}
		
		leave_enabled() {
			return this.game().player_joined( this.user() )
		}
		
		game_started() {
			return this.game().started()
		}
		
		game_closed() {
			return this.game().closed()
		}

		leader() {
			return this.game().leader()
		}
		
		status() {
			if ( this.game().closed() ) return 'Waiting player(s)'
			if ( this.game().started() ) return 'Fighting'
			return 'Waiting player(s)'
		}
		
	} 

}

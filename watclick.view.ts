namespace $.$$ {

	export class $my_warclick extends $.$my_warclick {
		
		game() {
			return this.domain().game_current()
		}
		
		user() {
			return this.domain().user()
		}
		
		health_red() {
			return String( this.game().health('red') )
		}
		
		health_blue() {
			return String( this.game().health('blue') )
		}
		
		attack_red() {
			this.game().attack( this.user() , 'red' )
		}
		
		attack_blue() {
			this.game().attack( this.user() , 'blue' )
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
			const label = this.user().team() === 'blue' ? this.Team_enemy_label() : this.Team_allies_label()
			return [ this.Team_red_title() , label , ... Players ].filter(Boolean)
		}
		
		@ $mol_mem
		team_blue_list() {
			const players = this.game().players().map( id => this.domain().person( id ) )
			const blue = players.filter( p => p.team() === 'blue' )
			const Players = blue.map( p => this.Player( p.id() ) )
			const label = this.user().team() === 'red' ? this.Team_enemy_label() : this.Team_allies_label()
			return [ this.Team_blue_title() , label , ... Players ].filter(Boolean)
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
			if ( this.game().closed() ) return 'Waiting for the players to join'
			if ( this.game().started() ) return 'Fighting'
			return 'Waiting for the players to join'
		}

		@ $mol_mem_key
		player_score( id : string ) {
			return String( this.game().player_score( this.domain().person( id ) ) )
		}
		
	} 

}

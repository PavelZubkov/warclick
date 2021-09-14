namespace $.$$ {

	export class $my_warclick extends $.$my_warclick {
		
		game() {
			return this.domain().game_current()
		}
		
		user() {
			return this.domain().user()
		}
		
		team() {
			return this.game().player_team( this.user() )
		}
		
		team_enemy() {
			return this.team() === $my_warclick_game_team.ally ? $my_warclick_game_team.enemy : $my_warclick_game_team.ally
		}
		
		@ $mol_mem
		name( next?: string ) {
			return this.user().name( next )
		}
		
		@ $mol_mem_key
		player_name( id : string ) {
			return this.domain().player( id ).name() + ' '
		}

		@ $mol_mem_key
		player_score( id : string ) {
			return String( this.game().player_score( this.domain().player( id ) ) )
		}
		
		ally_health() {
			return String( this.game().health( this.team() ) )
		}
		
		enemy_health() {
			return String( this.game().health( this.team_enemy() ) )
		}
		
		ally_attack() {
			this.game().attack( this.user() , this.team() )
		}
		
		enemy_attack() {
			this.game().attack( this.user() , this.team_enemy() )
		}
		
		attack_enabled() {
			if ( !this.user().name() ) return false
			return true
		}
		
		@ $mol_mem_key
		team_players( team : $my_warclick_game_team ) {
			return team === $my_warclick_game_team.ally ? this.game().players_ally() : this.game().players_enemy()
		}
		
		@ $mol_mem
		ally_team_list() {
			return this.team_players( this.team() ).map( id => this.Player( id ) )
		}
		
		@ $mol_mem
		enemy_team_list() {
			return this.team_players( this.team_enemy() ).map( id => this.Player( id ) )
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

		game_leader() {
			return this.game().leader()
		}
		
		game_status() {
			if ( !this.game_started() && !this.game_closed() ) return this.msg_waiting_players()
			if ( this.game().started() && !this.game_closed() ) return this.msg_fighting()
			return this.game_leader() === $my_warclick_game_team.ally ? this.msg_ally_win() : this.msg_enemy_win()
		}

	} 

}

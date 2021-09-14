namespace $ {
	
	export enum $my_warclick_game_team {
		ally , enemy
	}
	
	export type $my_warclick_game_action = { player: string , damage: -1 | 1 , to: $my_warclick_game_team  }
	
	export class $my_warclick_game extends $mol_object2 {
		
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
		
		actions( next?: $my_warclick_game_action[] ) {
			return ( this.state().sub( 'actions' ).list( next ) ?? [] ) as $my_warclick_game_action[]
		}
		
		action( player : $my_warclick_player , to: $my_warclick_game_team , damage: -1 | 1 ) {
			const actions = this.actions()
			this.actions( [ ... actions , { player : player.id() , to , damage } ] )
		}
		
		health( team: $my_warclick_game_team ) {
			const actions = this.actions().filter( a => a.to === team )
			const health = actions.reduce( ( sum , a ) => {
				return sum + a.damage
			} , 50 )
			if ( health <= 0 ) {
				$mol_fiber_defer( () => this.closed( true ) )
			}
			return health
		}
		
		player_score( player : $my_warclick_player ) {
			const actions = this.actions().filter( a => a.player === player.id() )
			const score = actions.reduce( ( sum , a ) => {
				return sum + Math.abs( a.damage )
			} , 0 )
			return score
		}
		
		players_ally( next?: string[] ) {
			return ( this.state().sub( 'players_ally' ).list( next ) ?? [] ) as string[]
		}
		
		players_enemy( next?: string[] ) {
			return ( this.state().sub( 'players_enemy' ).list( next ) ?? [] ) as string[]
		}
		
		started( next?: boolean ) {
			return Boolean( this.state().sub( 'started' ).value( next ) ?? false )
		}
		
		closed( next?: boolean ) {
			if ( next === true ) {
				this.domain().game_current( this.domain().game( $mol_guid() ) )
			}
			return Boolean( this.state().sub( 'closed' ).value( next ) ?? false )
		}
		
		@ $mol_mem_key
		player_team( player : $my_warclick_player ) {
			return this.players_ally().indexOf( player.id() ) !== -1 ? $my_warclick_game_team.ally : $my_warclick_game_team.enemy
		}
		
		join( player : $my_warclick_player ) {
			player.online_update()
			if ( this.closed() ) return

			const ally_count = this.players_ally().length
			const enemy_count = this.players_enemy().length

			if ( ally_count > enemy_count ) {
				const ids = new Set( this.players_enemy() )
				ids.add( player.id() )
				this.players_enemy( [ ...ids.values() ] )
			} else {
				const ids = new Set( this.players_ally() )
				ids.add( player.id() )
				this.players_ally( [ ...ids.values() ] )
			}
			
			if ( this.players_ally().length && this.players_enemy().length ) {
				$mol_fiber_defer( () => this.started( true ) )
			}
		}
		
		leave( player : $my_warclick_player ) {
			if ( this.closed() ) return

			const players = this.player_team( player ) === $my_warclick_game_team.ally
				? ( next?: string[] ) => this.players_ally( next )
				: ( next?: string[] ) => this.players_enemy( next )

			const ids = new Set( players() )
			ids.delete( player.id() )
			players( [ ...ids.values() ] )
			
			if ( !this.players_ally().length || !this.players_enemy().length ) {
				$mol_fiber_defer( () => this.closed( true ) )
			}
		}
		
		leader(): $my_warclick_game_team | null {
			const health_ally = this.health( $my_warclick_game_team.ally )
			const health_enemy = this.health( $my_warclick_game_team.enemy )
			const players_ally = this.players_ally()
			const players_enemy = this.players_enemy()

			if ( !players_ally.length || health_ally < health_enemy ) return $my_warclick_game_team.enemy
			if ( !players_enemy.length || health_ally > health_enemy ) return $my_warclick_game_team.ally
			return null
		}
		
		attack( player : $my_warclick_player , to : $my_warclick_game_team ) {
			player.online_update()

			if ( this.closed() ) return
			if ( !this.started() ) return
				
			if ( this.player_team( player ) === to ) this.action( player , to , 1 )
			else this.action( player , to , -1 )
		}
		
		player_joined( player : $my_warclick_player ) {
			const ids = new Set( [ ... this.players_ally() , ... this.players_enemy() ] )
			const joined = ids.has( player.id() )
			return joined
		}
	}
	
}

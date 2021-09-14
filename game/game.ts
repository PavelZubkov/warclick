namespace $ {
	
	export type $my_warclick_game_action = { player: string , damage: -1 | 1 , to: 'red' | 'blue'  }
	export class $my_warclick_game extends $mol_object2 {
		
		id(): string {
			return this.$.$mol_fail( new Error( 'id is not defined' ) )
		}
		
		domain(): $my_warclick_domain {
			return this.$.$mol_fail( new Error( 'domain is not defined' ) )
		}
		
		@ $mol_mem
		state() {
			return this.domain().state().doc( 'person' ).doc( this.id() )
		}
		
		actions( next?: $my_warclick_game_action[] ) {
			return ( this.state().sub( 'actions' ).list( next ) ?? [] ) as $my_warclick_game_action[]
		}
		
		action( player : $my_warclick_person , to: 'red' | 'blue' , damage: -1 | 1 ) {
			const actions = this.actions()
			this.actions( [ ... actions , { player : player.id() , to , damage } ] )
		}
		
		health( team: 'red' | 'blue' ) {
			const actions = this.actions().filter( a => a.to === team )
			const health = actions.reduce( ( sum , a ) => {
				return sum + a.damage
			} , 50 )
			if ( health <= 0 ) {
				$mol_fiber_defer( () => this.closed( true ) )
			}
			return health
		}
		
		player_score( player : $my_warclick_person ) {
			const actions = this.actions().filter( a => a.player === player.id() )
			const score = actions.reduce( ( sum , a ) => {
				return sum + Math.abs( a.damage )
			} , 0 )
			return score
		}
		
		players( next?: string[] ) {
			return ( this.state().sub( 'players' ).list( next ) ?? [] ) as string[]
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
		players_team( team : 'red' | 'blue' ) {
			return this.players().map( id => this.domain().person( id ) ).filter( p => p.team() === team )
		}
		
		join( player : $my_warclick_person ) {
			player.online_update()
			if ( this.closed() ) return

			const ids = new Set( this.players() )
			const blue_count = this.players_team( 'blue' )
			const red_count = this.players_team( 'red' )

			if ( red_count > blue_count ) player.team('blue')
			else player.team('red')

			ids.add( player.id() )
			const next = [ ...ids.values() ]
			this.players( next )
			
			if ( this.players_team( 'red' ).length && this.players_team( 'blue' ).length ) {
				this.started( true )
			}
		}
		
		leave( player : $my_warclick_person ) {
			if ( this.closed() ) return

			const ids = new Set( this.players() )
			ids.delete( player.id() )
			this.players( [ ...ids.values() ] )
			
			if ( !this.players_team( 'red' ).length || !this.players_team( 'blue' ) ) {
				this.closed( true )
			}
		}
		
		leader(): 'red' | 'blue' | 'equal' {
			const health_red = this.health('red')
			const health_blue = this.health('blue')
			const players_red = this.players_team( 'red' )
			const players_blue = this.players_team( 'blue' )

			if ( !players_red.length ) return 'blue'
			if ( !players_blue.length ) return 'red'
			if ( health_red > health_blue ) return 'red'
			if ( health_red < health_blue ) return 'blue'
			
			return 'equal'
		}
		
		kick_inactive() {
			const players = this.players().map( id => this.domain().person( id ) )	
			for ( const player of players ) {
				if ( ! player.online_near() ) this.leave( player )
			}
		}
		
		attack( player : $my_warclick_person , to : 'red' | 'blue') {
			player.online_update()
			// this.kick_inactive()
			if ( this.closed() ) return
			if ( !this.started() ) return
				
			if ( player.team() === to ) this.action( player , to , 1 )
			else this.action( player , to , -1 )
		}
		
		player_joined( person : $my_warclick_person ) {
			const ids = new Set( this.players() )
			const joined = ids.has( person.id() )
			return joined
		}
	}
	
}

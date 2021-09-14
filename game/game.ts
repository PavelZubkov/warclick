namespace $ {
	
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
		
		health_red( next?: number ) {
			return Number( this.state().sub( 'health_self' ).value( next ) ?? 50 )
		}
		
		health_blue( next?: number ) {
			return Number( this.state().sub( 'health_enemy' ).value( next ) ?? 50 )
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
		
		join( person : $my_warclick_person ) {
			person.online_update()
			if ( this.closed() ) return

			const ids = new Set( this.players() )
			const blue_count = this.players_team( 'blue' )
			const red_count = this.players_team( 'red' )

			if ( red_count > blue_count ) person.team('blue')
			else person.team('red')

			ids.add( person.id() )
			const next = [ ...ids.values() ]
			this.players( next )
			
			if ( this.players_team( 'red' ).length && this.players_team( 'blue' ).length ) {
				this.started( true )
			}
		}
		
		leave( person : $my_warclick_person ) {
			if ( this.closed() ) return

			const ids = new Set( this.players() )
			ids.delete( person.id() )
			this.players( [ ...ids.values() ] )
			
			if ( !this.players_team( 'red' ).length || !this.players_team( 'blue' ) ) {
				this.closed( true )
			}
		}
		
		leader(): 'red' | 'blue' | 'nothing' {
			const health_red = this.health_red()
			const health_blue = this.health_blue()
			const players_red = this.players_team( 'red' )
			const players_blue = this.players_team( 'blue' )

			if ( !players_red.length ) return 'blue'
			if ( !players_blue.length ) return 'red'
			if ( health_red > health_blue ) return 'red'
			if ( health_red < health_blue ) return 'blue'
			
			return 'nothing'
		}
		
		kick_inactive() {
			const players = this.players().map( id => this.domain().person( id ) )	
			for ( const player of players ) {
				if ( ! player.online_near() ) this.leave( player )
			}
		}
		
		attack_red( person : $my_warclick_person ) {
			person.online_update()
			// this.kick_inactive()
			if ( this.closed() ) return
			if ( !this.started() ) return

			const current = this.health_red()
			
			const damage = person.team() === 'red' ? 1 : -1
			this.health_red( this.health_red() + damage )
			
			if ( current < 1 ) {
				return this.closed( true )
			}
		}
		
		attack_blue( person : $my_warclick_person ) {
			person.online_update()
			// this.kick_inactive()
			if ( this.closed() ) return
			if ( !this.started() ) return

			const current = this.health_blue()
			
			if ( current < 1 ) {
				return this.closed( true )
			}

			const damage = person.team() === 'blue' ? 1 : -1
			this.health_blue( this.health_blue() + damage )
			
			if ( current < 1 ) {
				return this.closed( true )
			}
		}
		
		player_joined( person : $my_warclick_person ) {
			const ids = new Set( this.players() )
			const joined = ids.has( person.id() )
			return joined
		}
	}
	
}

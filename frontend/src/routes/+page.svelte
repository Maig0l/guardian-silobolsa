<script lang="ts">
	import { onMount } from 'svelte';

	onMount(() => {
		console.log('Guardian Silobolsa - Sistema de Monitoreo IoT');
	});
</script>

<main>
	<div class="container">
		<header>
			<h1>🌾 Guardian Silobolsa</h1>
			<p class="subtitle">Sistema de Monitoreo IoT para Silobolsas Agrícolas</p>
		</header>

		<section class="hero">
			<div class="hero-content">
				<h2>¡Hola Mundo!</h2>
				<p>
					Bienvenido al sistema de monitoreo inteligente para silobolsas. 
					Monitorea en tiempo real los niveles de CO2, temperatura y humedad 
					para proteger tu cosecha.
				</p>
				<div class="features">
					<div class="feature">
						<span class="icon">📡</span>
						<h3>Monitoreo en Tiempo Real</h3>
						<p>Sensores IoT conectados vía MQTT</p>
					</div>
					<div class="feature">
						<span class="icon">⚠️</span>
						<h3>Alertas Inteligentes</h3>
						<p>Notificaciones automáticas ante peligros</p>
					</div>
					<div class="feature">
						<span class="icon">📊</span>
						<h3>Dashboard Completo</h3>
						<p>Visualización de datos históricos</p>
					</div>
				</div>
			</div>
		</section>
	</div>
</main>

<style>
	main {
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	header {
		text-align: center;
		margin-bottom: 3rem;
		color: white;
	}

	h1 {
		font-size: 3.5rem;
		margin: 0;
		text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
	}

	.subtitle {
		font-size: 1.2rem;
		margin: 0.5rem 0 0 0;
		opacity: 0.9;
	}

	.hero {
		background: white;
		border-radius: 20px;
		padding: 3rem;
		box-shadow: 0 20px 40px rgba(0,0,0,0.1);
	}

	.hero-content {
		text-align: center;
	}

	.hero-content h2 {
		font-size: 2.5rem;
		color: #333;
		margin-bottom: 1rem;
	}

	.hero-content p {
		font-size: 1.1rem;
		color: #666;
		max-width: 600px;
		margin: 0 auto 2rem;
		line-height: 1.6;
	}

	.features {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
		margin-top: 3rem;
	}

	.feature {
		text-align: center;
		padding: 2rem;
		border-radius: 15px;
		background: #f8f9fa;
		transition: transform 0.3s ease, box-shadow 0.3s ease;
	}

	.feature:hover {
		transform: translateY(-5px);
		box-shadow: 0 10px 30px rgba(0,0,0,0.1);
	}

	.icon {
		font-size: 3rem;
		display: block;
		margin-bottom: 1rem;
	}

	.feature h3 {
		font-size: 1.3rem;
		color: #333;
		margin: 0 0 0.5rem 0;
	}

	.feature p {
		color: #666;
		margin: 0;
		line-height: 1.5;
	}

	@media (max-width: 768px) {
		.container {
			padding: 1rem;
		}

		h1 {
			font-size: 2.5rem;
		}

		.hero {
			padding: 2rem;
		}

		.hero-content h2 {
			font-size: 2rem;
		}

		.features {
			grid-template-columns: 1fr;
			gap: 1rem;
		}
	}
</style>

<?php
session_start();
	if(isset($_POST['send'])) {
		extract($_POST);
	if(isset($username) && $username != "" &&
	   isset($email) && $email != "" &&
	   isset($phone) && $phone != ""){

		// envoyé le mail //
		// mon mail //
			$to = "felix.fritz@hotmail.com";
		// objet du mail //
			$subject = "Vous avez reçu un message de : " . $email;

			$message = "
				<p>Vous avez reçu un message de <strong> ".$email."</strong></p>
				<p><strong>nom :</strong> ".$username."</p>
				<p><strong>téléphone :</strong>".$phone."</p>
				<p><strong>message :</strong>".$message."</p>
			";
		// toujours remplir pour envoyer mail HTML //
		$headers = "MIME-Version: 1.0" ."\r\n";
		$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";

		// More headers //
		$headers .= 'From: <'.$email.'>' . "\r\n";

		// envoi du mail //
		$send = mail($to,$subject,$message,$headers);

		// vérification de l'envoi //
		if(!$send){
			$_SESSION['succes_message'] = "message envoyé";

		}else {
			$info = "message non remis";
		}

		
 
	}else {
		//si elles sont vides
		$info = "veuillez remplir tous les champs";
	}
}
?>

<!DOCTYPE html>
<html lang="fr">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, intital-scale=1.0">
		<meta http-equiv="X-UA-Compatible" content="ie-edge">
		<title>Contact</title>
		<link rel="apple-touch-icon" sizes="180x180" href="favicon/ff/apple-touch-icon.png">
        <link rel="icon" type="image/png" sizes="32x32" href="favicon/ff/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="favicon/ff/favicon-16x16.png">
        <link rel="manifest" href="favicon/ff/site.webmanifest">
        <link rel="mask-icon" href="favicon/ff/safari-pinned-tab.svg" color="#56afc9">
        <meta name="msapplication-TileColor" content="#000000">
        <meta name="theme-color" content="#ffffff">
		<link rel="stylesheet" type="text/css" href="css/styles.css">
	</head>

		<header class="IBMPlexMono">
			<nav id="nav">
				<ul>
					<li>
						<a href="index.html">Félix Fritz</a>
					</li>
					<li>
						<a href="contact.php">Contact</a>
					</li>
					<li>
						<a href="studiorama.html">Studiorama Band</a>
					</li>
				</ul>
			</nav>
		</header>

<body class="IBMPlexMono">
	
	<h1>
		Félix Fritz
	</h1>
	<h2>
		Designer Graphique<br>
		Web Designer<br>
		Directeur Artistique<br>
	</h2>
	<div class="texte">
		<p>
		mail: felix.fritz@hotmail.com<br/>
		tél: 06.01.02.67.29
		</p>
		<h2>
			À propos
		</h2>
		<p>
			Designer&nbspgraphique titulaire d'un&nbspDiplôme National Supérieur d'Expression Plastique en&nbspDesign Média obtenu à&nbspl'École Supérieure d'Art et&nbspDesign de&nbspSaint-Étienne en&nbsp2022. (→&nbsp<a href="https://www.citedudesign.com/fr/esadse/projets-des-diplomes/2022/fritz-felix-409" target="_BLANK"><i>citedudesign.com</i></a>)<br>
			<br>
			Réalisation d'affiches, d'objets imprimés (catalogues, brochures, bannières) et&nbspd'identités visuelles, du&nbspsupport imprimé jusqu'au&nbspsite internet, tout&nbspen réalisant la&nbspdirection artistique du&nbspprojet.<br>
			<br>
			Freelance depuis&nbsp2022<br>
			Disponible et&nbspouvert à&nbsptoutes formes de&nbspproposition<br>
			Pour toutes demandes →&nbspfelix.fritz@hotmail.com
		</p>

		<?php
		// afficher le message d'erreur //
		if(isset($info)) { ?>
			<p class="request_message" style="color:red">
				<?=$info?>
			</p>
			<?php
			}
		?>

		<?php
		// afficher le message de succès //
		if(isset($_SESSION['succes_message'])) { ?>
			<p class="request_message" style="color:green">
				<?=info?>
			</p>
			<?php
			}
		?>
		
		<form action="" method="POST">
			<label>&nbspnom</label>
			<input type="text" name="username" required>
			<label>&nbspmail</label>
			<input type="email" name="email" required>
			<label>&nbsptéléphone</label>
			<input type="number" name="phone" required>
			<label>&nbspmessage</label>
			<textarea name="message" cols="30" rows="10" required></textarea>
			<button name="send">envoyer</button>
			<br>
		</form>
		<h2>
			<br>
			Expériences
		</h2>
		<p>
			<i>2023</i><br>
			client&nbsp: Cité&nbspdu&nbspDesign<br>
			lieu&nbsp: Saint-Étienne&nbsp(42000)<br>
			commande&nbsp: Réalisation du&nbspCatalogue des&nbspDiplômé·e·s&nbsp2022 de&nbspl'ESADSE.<br>
			<br>
			<i>Oct.&nbsp2022</i><br>
			client&nbsp: Atelier d'architecture Chaix&nbspet&nbspMorel →&nbsp<i><a href="https://www.chaixetmorel.com/">chaixetmorel.com</a></i><br>
			lieu&nbsp: Paris&nbsp20&nbsp(75020)<br>
			commande&nbsp: Application de la nouvelle charte graphique (réalisée par Denis Coueignoux) de l'agence sur les différents supports (dossier de presse, dossier de participation aux concours, papeterie) + réalisation de la signalétique pour la soirée des 40 ans de l'agence du 28 juin 2023.<br>
			<br>
			<i>2022</i><br>
			client&nbsp: Cité&nbspdu&nbspDesign<br>
			lieu&nbsp: Saint-Étienne&nbsp(42000)<br>
			commande&nbsp: Réalisation de&nbspl'identité visuelle de&nbspl'exposition étudiante →&nbsp<i><a href="lmsr.html">Le&nbspMonde,&nbspSinon&nbspRien</a></i> dans&nbsple&nbspcadre de&nbspla&nbsp12e&nbspBiennale Internationale Design de&nbspSaint-Étienne&nbsp2022.<br>
			<br>

			<i>2021</i><br>
			client&nbsp: École Supérieure d'Art et&nbspDesign de&nbspSaint-Étienne<br>
			lieu&nbsp: Saint-Étienne&nbsp(42000)<br>
			commande&nbsp: Réalisation de&nbspl'identité visuelle des&nbsp→&nbsp<i><a href="jpov.html">Journées Portes Ouvertes [&nbspVirtuelles&nbsp]</a></i> de&nbspl'École.<br>
		</p>
		<h2>
			Réseaux
		</h2>
		<p>
		→&nbsp<a href="https://www.linkedin.com/in/f%C3%A9lix-fritz-11463229b/" target="_BLANK">
			<i>Linkedin</i>
		</a><br>
		→&nbsp<a href="https://www.instagram.com/felixfritz_stud/" target="_BLANK">
			<i>Instagram</i>
		</a>
	</p>
</div>
	
	<h3>
		<img src="img/felix_fritz.jpg" width="70%">
	</h3>

<div class="texte">
	<h2>
		<br>
		+
	</h2>
	<p>
		Chaque&nbspnom&nbspen&nbspitalique précédé d'une&nbspflèche&nbsp(→) est&nbspun&nbsplien vers&nbspune&nbsppage, donc&nbspn'hésitez pas&nbspà&nbspcliquer.
	</p>
	<h2>
		Typographies
	</h2>
	<p>
		↑&nbspIBM&nbspPLex&nbspMono&nbspRegular
		<div class="italic">↗&nbspIBM&nbspPLex&nbspMono&nbspItalic</div>
	</p>
</div>
	<a href="#" class="to-top">
		<div style="font-size: 20px;">↑</div>
	</a>
	<script src="anim.js"></script>
</body>
<footer>
	&#169; Félix Fritz - 2024
</footer>

</html>
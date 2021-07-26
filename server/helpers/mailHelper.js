const nodemailer = require ("nodemailer");

module.exports = {

    

    getPasswordResetURL (user, token)  {
        userId = user._id;
        return `http://localhost:8100/password/reset/${userId}/${token}`
    },

  resetPasswordTemplate  (user, url) {
        const from = "Kick France";
        const to = user.email
        const subject = "KICK - 🔑 Réinitialisation du mot de passe"
        const html = `
  <p>Salut ${user.displayName || user.email},</p>
  <p>Nous avons appris que vous avez perdu votre mot de passe Kick, navré de l'apprendre !</p>
  <p>Mais pas d'inquiétude ! Vous pouvez utiliser le lien suivant pour réinitialiser votre mot de passe :</p>
  <a href=${url}>Lien de réinitialisation</a>
  <p>Si vous n'utilisez pas ce lien dans l'heure qui suit, il expirera.</p>
  <p>La musique évolue. La manière de la partager aussi</p>
  <p>–A bientôt sur l'application Kick</p>
  `
        return { from, to, subject, html }
    }
    
}
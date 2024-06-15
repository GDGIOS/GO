/**
 * @project Formulario de Inscricao no Mini Curso de Introducao a Golang
 * @description Esse arquivo contem as acoes para salvar a inscricao do participante do minicurso realizado pelo GDG Ilheus
 * @author Diogo Cerqueira <contato@diogocerqueira.dev.br>
 * @date June 10, 2024
 * @version 1.0
 */

document.addEventListener('DOMContentLoaded', function () {
    let nv = document.getElementById("num_vacancies");
    const getVacancies = () => {
        fetch('https://gdg-ilheus-api.diogocerqueira.dev.br?action=vacancies', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => response.json())
            .then(data => {
                if (data.error) {
                    throw new Error(data.error);
                }
                nv.innerHTML = data.vacancies + " Vagas";
                // O número de vagas chegou ao fim, não há motivo para continuar buscando se já sabemos que não podemos mais receber inscrições, all right? :D
                if (!data.vacancies) clearInterval(vacanciesIntval);
            })
            .catch(error => {
                console.log(error);
            });
    }
    getVacancies();
    const vacanciesIntval = setInterval(getVacancies, 10000);


    const subscriptionSection = document.getElementById('subscription'),
        paymentSection = document.getElementById('payment'),
        finishSection = document.getElementById('finish');

    const showPayment = (imgQr, payload, uuid) => {
        let qrcode = document.getElementById('pix-payment-qrcode'),
            pixPayload = document.getElementById('pix-payload'),
            pixCopy = document.getElementById('pix-copy-msg');

        qrcode.src = imgQr;
        pixPayload.value = payload;

        subscriptionSection.classList.add('hide-subscription');
        subscriptionSection.classList.remove('show-subscription');
        paymentSection.classList.add('show-payment');
        paymentSection.classList.remove('hide-payment');

        setTimeout(function () {
            subscriptionSection.style.display = 'none';
            paymentSection.style.display = 'block';
        }, 600);

        const paymentIntval = setInterval(() => {
            fetch('https://gdg-ilheus-api.diogocerqueira.dev.br?action=payment&uuid=' + uuid, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(response => response.json())
                .then(data => {
                    if (data.error) {
                        throw new Error(data.error);
                    }

                    if (data.paid || data.expired) {
                        clearInterval(paymentIntval);
                        if (data.paid) showFinish();
                        if (data.expired) window.location.reload();
                    }
                })
                .catch(error => {
                    console.log(error);
                });
        }, 5000);
    }

    const showFinish = (viaSubscription = false) => {
        if (viaSubscription) {
            subscriptionSection.classList.add('hide-subscription');
            subscriptionSection.classList.remove('show-subscription');
        } else {
            paymentSection.classList.add('hide-payment');
            paymentSection.classList.remove('show-payment');
        }

        finishSection.classList.add('show-finish');
        finishSection.classList.remove('hide-finish');

        setTimeout(function () {
            if (viaSubscription) subscriptionSection.style.display = 'none';
            else paymentSection.style.display = 'none';
            finishSection.style.display = 'block';
        }, 600);

        let btnCalendar = document.getElementById("add-to-calendar");
        btnCalendar.addEventListener("click", function () {
            let evento = {
                title: "Mini Curso de Introdução a Golang - GDG Ilhéus",
                startDate: "20240715T000000Z",
                endDate: "20240719T235959Z",
                details:
                    "Mini Curso de Introdução a Golang, organizado pelo GDG Ilhéus.\n\n" +
                    "O curso abordará os fundamentos da linguagem Golang e capacitará os participantes a escrever seus primeiros programas.\n\n" +
                    "Público-alvo: Desenvolvedores iniciantes ou com experiência em outras linguagens de programação.\n\n" +
                    "O curso é gratuito e as vagas são limitadas.\n\n" +
                    "Inscrições pelo site do GDG Ilhéus.",
                location: "Ilhéus, BA, Brasil"
            };

            let detailsEncoded = evento.details.replace(/\n/g, '%0A');

            var url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(evento.title)}&dates=${encodeURIComponent(evento.startDate)}/${encodeURIComponent(evento.endDate)}&details=${detailsEncoded}&location=${encodeURIComponent(evento.location)}&sf=true&output=xml`;

            window.open(url, '_blank');
        });
    }

    const EMAIL_VALIDATOR = /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        PHONE_VALIDATOR = /^\(\d{2}\) \d{4,5}-\d{4}$/;

    let input = document.getElementById('phone'),
        form = document.querySelector("form"),
        formBtn = document.querySelector("form>button"),
        alert = document.querySelector(".alert");

    input.addEventListener('input', function () {
        let value = input.value.replace(/\D/g, ''),
            phone = '';

        if (value.length > 0) phone += '(' + value.substring(0, 2);
        if (value.length > 2) phone += ') ' + value.substring(2, 7);
        if (value.length > 7) phone += '-' + value.substring(7, 11);

        input.value = phone;
    });

    input.addEventListener('blur', () => input.value = input.value.length < 15 ? '' : input.value);

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        let name = document.getElementById("name"),
            email = document.getElementById("email"),
            phone = input;

        if (!name.value.trim()) {
            alert.style.display = "block";
            alert.textContent = "Informe um nome válido para continuar!";
            return;
        }

        if (!EMAIL_VALIDATOR.test(email.value.trim())) {
            alert.style.display = "block";
            alert.textContent = "Informe um endereço de e-mail válido para continuar!";
            return;
        }

        if (!PHONE_VALIDATOR.test(phone.value.trim())) {
            alert.style.display = "block";
            alert.textContent = "Informe um número de whatsApp válido para continuar!";
            return;
        }

        const icon = document.createElement('i');
        icon.innerHTML = `<svg class="icon_loading" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
        <!-- Círculo principal -->
        <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(255, 255, 255, 0.4)" stroke-width="2"/>
        <!-- "Corte" no círculo -->
        <circle cx="12" cy="12" r="10" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="60 300" transform="rotate(-90 12 12)"/>
    </svg>`

        alert.style.display = "none";
        name.disabled =
            email.disabled =
            phone.disabled =
            formBtn.disabled = "disabled";
        formBtn.innerHTML = ''; // Limpar conteúdo do botão
        formBtn.appendChild(icon);
        formBtn.appendChild(document.createTextNode(' Aguarde...'));

        fetch('https://gdg-ilheus-api.diogocerqueira.dev.br?action=sign', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name.value,
                email: email.value,
                phone: phone.value
            })
        }).then((response) => { console.log(response.text()); response.json() })
            .then(data => {
                if (data.error) {
                    throw new Error(data.error);
                }
                if (data.signed) showFinish(true);
                else showPayment(data.qrcode, data.payload, data.uuid);
                clearInterval(vacanciesIntval);
            })
            .catch(error => {
                console.log(error);
                alert.textContent = "Erro ao salvar inscrição: " + (error || "Unknow Error") + " - Tente novamente dentro de alguns minutos.";
                alert.style.display = "block";
                name.disabled =
                    email.disabled =
                    phone.disabled =
                    formBtn.disabled = false;
                formBtn.textContent = "Inscrever-se";
            });
    });
});
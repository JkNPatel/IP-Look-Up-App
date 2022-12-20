window.addEventListener('DOMContentLoaded', (event) => {

    // tags input intialize
    var tagInput = new TagsInput({
        selector: 'ips',
        duplicate: false,
        max: 100
    });

    let btnSubmit = document.getElementById('submit');

    btnSubmit.onclick = function () { getIPData(); }

    // fetch API for post
    async function postData(url = '', data = {}) {

        const response = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: JSON.stringify(data)
        });
        return response.json();
    }

    // IP address validator
    function validateIP(input) {
        for (var i = 0; i < input.length; i++) {
            if (/^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/.test(input[i])) {
                continue;
            } else {
                return false
            }
        }
        return true
    }

    // get data from ip address
    function getIPData() {
        let ipAddresses = (document.getElementById('ips').value).split(',');
        let message = document.getElementById('message');
        let resultTable = document.getElementById('result');
        let errorsMessage = document.getElementById('errors');

        resultTable.innerHTML = '';
        errorsMessage.innerHTML = '';

        if (ipAddresses.length < 1 || ipAddresses[0] == '') {
            message.innerHTML = 'Please enter at least 1 ipaddress. *Press enter,comma or tab to add tags';
        }
        else if (!validateIP(ipAddresses)) {
            message.innerHTML = 'Please enter valid ipaddresses';
        }
        else {
            message.innerHTML = '';
            // request ip data
            postData('/getIPData', { ips: ipAddresses })
                .then((response) => {

                    // populate table
                    let start = `<h3 class="my-4 text-center">IP Results</h3>
                    <table id="myTable" class="table table-bordered table-hover">
                        <thead>
                            <th>IP Address</th>
                            <th>Country Code</th>
                            <th>Postal Code</th>
                            <th>City Name</th>
                            <th>Time Zone</th>
                            <th>Accuracy Radius</th>
                        </thead>
                        <tbody>`;
                    let end = `</tbody></table>`;
                    let result = ``;

                    if (response.data.length < 1) {
                        resultTable.innerHTML = 'No Data Found!';
                        return
                    }
                    else if (response.errors.length > 0) {
                        response.errors.forEach(ele => errorsMessage.innerHTML += ele + '<br>');
                    }

                    response.data.forEach(ele => {
                        result += `<tr>
                            <td>${ele.ip}</td>
                            <td>${ele.countryCode}</td>
                            <td>${ele.postalCode}</td>
                            <td>${ele.cityName}</td>
                            <td>${ele.timeZone}</td>
                            <td>${ele.accuracyRadius}</td>
                        </tr>`;
                    });

                    result = start + result + end;
                    resultTable.innerHTML = result;
                });
        }
    }
});
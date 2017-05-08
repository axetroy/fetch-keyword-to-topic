import co from 'co';

function main() {
  makeSureFetchButton();
  onStateChange(function() {
    const timer = setInterval(() => {
      clearInterval(timer);
      makeSureFetchButton();
    }, 500);
  });
}

function onStateChange(func) {
  addEventListener(
    'click',
    event => {
      const $done = document.querySelector('button.js-repo-topics-form-done');
      if (event.target !== $done) return;
      func(event);
    },
    false
  );
}

function makeSureFetchButton() {
  const $topicsContainer = document.getElementById('topics-list-container');
  const $manageTopics = document.querySelector('.js-repo-topics-form-toggle');
  if (!$topicsContainer || !$manageTopics) return;
  $topicsContainer.appendChild(createFetchButton());
}

function createFetchButton() {
  const $button = document.createElement('button');
  $button.className = 'btn-link';
  $button.type = 'button';
  $button.id = 'fetch-from-package';
  $button.style.color = '#4CAF50';
  $button.innerHTML = 'Fetch from package.json';
  $button.onclick = clickHandler;
  return $button;
}

function clickHandler(event) {
  event.preventDefault();
  co(function*() {
    document
      .querySelector('.btn-link.js-repo-topics-form-toggle.js-details-target')
      .click();

    const packageJson = yield fetchPackageJson();

    function check() {
      const $formUl = document.querySelector('.js-tag-input-selected-tags');
      if (!$formUl) return;
      clearInterval(timer);

      const formValues = Array.from($formUl.querySelectorAll('input')).map(
        $input => $input.value
      );

      const keywords = packageJson.keywords || [];

      const $input = document.querySelector('#repo_topics');

      keywords
        .filter(kw => kw)
        .filter(kw => !formValues.includes(kw))
        .forEach(keyword => {
          $input.value = keyword;
          $input.click();
          $input.blur();
        });
      $input.focus();
    }

    const timer = setInterval(check, 500);
  }).catch(function(err) {
    console.error(err);
  });
}

function fetchPackageJson() {
  const $package = document.querySelector(
    'tr.js-navigation-item td.content a[title="package.json"]'
  );
  let packageUrl = $package.href;
  packageUrl =
    packageUrl
      .replace('/blob/', '/')
      .replace('github', 'raw.githubusercontent') + `?random=${Math.random()}`;
  return fetch(packageUrl).then(function(res) {
    return res.json();
  });
}

main();

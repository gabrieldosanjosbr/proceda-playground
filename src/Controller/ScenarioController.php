<?php

namespace App\Controller;

use Proceda\Fixtures\Scenario\ConembV31;
use Proceda\Fixtures\Scenario\DoccobV30;
use Proceda\Fixtures\Scenario\DoccobV50;
use Proceda\Fixtures\Scenario\NotfisV31;
use Proceda\Fixtures\Scenario\NotfisV50;
use Proceda\Fixtures\Scenario\OcorenV31;
use Proceda\Fixtures\Scenario\OcorenV50;
use Proceda\Infrastructure\Serializer\Factory as SerializerFactory;
use Proceda\Proceda;
use Proceda\Schema\LayoutVersion;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\Exception\ExceptionInterface;

final class ScenarioController extends AbstractController
{
	/**
	* @throws ExceptionInterface
	*/
	#[Route(
		path: '/api/scenarios/{layout}/{version}/{scenario}',
		methods: ['GET'],
	)]
	public function __invoke(
		string $layout,
		string $version,
		string $scenario,
	): JsonResponse {
		[$intercambio, $schemaManager] = match (
			"$layout:$version:$scenario"
		) {
			'notfis:v31:all-fields' => [
				NotfisV31::allFields(),
				Proceda::notfis(LayoutVersion::V31)
					->getSchemaManager(),
			],

			'notfis:v50:required-fields' => [
				NotfisV50::requiredFields(),
				Proceda::notfis(LayoutVersion::V50)
					->getSchemaManager(),
			],

			'notfis:v50:all-fields' => [
				NotfisV50::allFields(),
				Proceda::notfis(LayoutVersion::V50)
					->getSchemaManager(),
			],

			'ocoren:v31:all-fields' => [
				OcorenV31::allFields(),
				Proceda::ocoren( LayoutVersion::V31)
					->getSchemaManager(),
			],

			'ocoren:v50:all-fields' => [
				OcorenV50::allFields(),
				Proceda::ocoren(LayoutVersion::V50)
					->getSchemaManager(),
			],

			'doccob:v30:all-fields' => [
				DoccobV30::allFields(),
				Proceda::doccob(LayoutVersion::V30)
					->getSchemaManager(),
			],

			'doccob:v50:all-fields' => [
				DoccobV50::allFields(),
				Proceda::doccob(LayoutVersion::V50)
					->getSchemaManager(),
			],

			'conemb:v31:all-fields' => [
				ConembV31::allFields(),
				Proceda::conemb(LayoutVersion::V31)
					->getSchemaManager(),
			],

			default => throw $this->createNotFoundException(),
		};

		$serializer = SerializerFactory::create(
			$schemaManager,
		);

		return new JsonResponse(
			$serializer->serialize(
				$intercambio,
				'json',
			),
			json: true,
		);
	}
}
